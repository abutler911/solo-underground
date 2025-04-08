// server/cron/fetchAndRewriteNews.js
const cron = require("node-cron");
const axios = require("axios");
const OpenAI = require("openai");
const { jsonrepair } = require("jsonrepair");
const topics = require("../utils/topics");
const Article = require("../models/Article");
const reporters = require("../utils/reporters");
const Parser = require("rss-parser");
const fs = require("fs").promises;
const path = require("path");
const parser = new Parser();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Stats tracking
let stats = {
  articlesFetched: 0,
  articlesProcessed: 0,
  articlesRejected: 0,
  totalCost: 0,
  reporterStats: {},
  lastUpdated: new Date(),
};

// Cache directory for RSS feeds
const CACHE_DIR = path.join(__dirname, "../cache");
const RSS_CACHE_FILE = path.join(CACHE_DIR, "rss-cache.json");

// Initialize cache directory if it doesn't exist
async function initializeCache() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    console.log("[CACHE] Directory initialized");
  } catch (err) {
    console.error("[CACHE] Error initializing cache directory:", err.message);
  }
}

// Track which reporters and topics were recently used
let recentReporters = [];
let recentTopics = [];

// Reporter stats tracking
function initReporterStats() {
  for (const reporter of reporters) {
    if (!stats.reporterStats[reporter.name]) {
      stats.reporterStats[reporter.name] = {
        articlesWritten: 0,
        avgQualityScore: 0,
        avgWordCount: 0,
        topicsCovered: {},
        lastUsed: null,
      };
    }
  }
}

// Get diversity-aware topics
function getRandomTopicsWithDiversity(count = 2) {
  // Filter out recently used topics
  const availableTopics = topics.filter(
    (topic) => !recentTopics.includes(topic)
  );

  // If all topics were recently used, reset tracking
  const topicPool = availableTopics.length >= count ? availableTopics : topics;

  // Get random topics
  const selectedTopics = [...topicPool]
    .sort(() => 0.5 - Math.random())
    .slice(0, count);

  // Update tracking (keep last 5)
  recentTopics = [...recentTopics, ...selectedTopics];
  if (recentTopics.length > 5) {
    recentTopics = recentTopics.slice(recentTopics.length - 5);
  }

  return selectedTopics;
}

// Get a reporter biased toward the topic
function getReporterForTopic(topic) {
  // Find reporters who specialize in this topic
  const specializedReporters = reporters.filter(
    (reporter) => reporter.topics && reporter.topics.includes(topic)
  );

  // Use specialized if available, otherwise filter by recently used
  const reporterPool =
    specializedReporters.length > 0
      ? specializedReporters.filter((r) => !recentReporters.includes(r.name))
      : reporters.filter((r) => !recentReporters.includes(r.name));

  // Final pool selection
  const finalPool =
    reporterPool.length > 0
      ? reporterPool
      : specializedReporters.length > 0
      ? specializedReporters
      : reporters;

  // Select reporter
  const reporter = finalPool[Math.floor(Math.random() * finalPool.length)];

  // Update tracking (keep last 3)
  recentReporters.push(reporter.name);
  if (recentReporters.length > 3) {
    recentReporters.shift();
  }

  // Update reporter stats
  stats.reporterStats[reporter.name].lastUsed = new Date();

  return reporter;
}

// Sanitize text for prompts
function sanitizeText(text) {
  if (!text) return "";
  return text
    .replace(/<[^>]*>/g, "") // Strip HTML
    .replace(/\s+/g, " ") // Collapse whitespace
    .replace(/["']/g, "") // Remove quotes
    .trim() // Trim excess whitespace
    .substring(0, 1500); // Limit length for cost control
}

// Estimate tokens
function estimateTokenCount(text) {
  // Rough estimation: ~4 chars per token for English text
  return Math.ceil(text.length / 4);
}

// Check for article duplication
async function isDuplicateArticle(article) {
  try {
    // Check exact URL match
    const exactMatch = await Article.findOne({ sourceUrl: article.url });
    if (exactMatch) {
      console.log(`[DEDUP] Exact URL match found for "${article.title}"`);
      return true;
    }

    // Check title similarity (basic implementation - could use a proper string similarity lib)
    const normalizedTitle = article.title.toLowerCase().replace(/[^\w\s]/g, "");
    const similarTitleArticles = await Article.find({
      $or: [
        { title: { $regex: normalizedTitle.substring(0, 30), $options: "i" } },
        {
          original: { $regex: normalizedTitle.substring(0, 30), $options: "i" },
        },
      ],
    });

    if (similarTitleArticles.length > 0) {
      console.log(`[DEDUP] Similar title match found for "${article.title}"`);
      return true;
    }

    return false;
  } catch (err) {
    console.error("[DEDUP] Error checking for duplicates:", err.message);
    return false; // Default to not duplicate on error
  }
}

// Read or create RSS cache
async function getRssCache() {
  try {
    const data = await fs.readFile(RSS_CACHE_FILE, "utf8");
    const cache = JSON.parse(data);

    // Check if cache is still valid (less than 24 hours old)
    const cacheTime = new Date(cache.timestamp);
    const now = new Date();
    const hoursSinceCache = (now - cacheTime) / (1000 * 60 * 60);

    if (hoursSinceCache < 24) {
      console.log(
        `[CACHE] Using RSS cache from ${hoursSinceCache.toFixed(1)} hours ago`
      );
      return cache.articles;
    }
    console.log("[CACHE] Cache expired, fetching fresh RSS feeds");
    return null;
  } catch (err) {
    console.log("[CACHE] No valid cache found, fetching fresh RSS feeds");
    return null;
  }
}

// Save RSS cache
async function saveRssCache(articles) {
  try {
    const cache = {
      timestamp: new Date(),
      articles: articles,
    };
    await fs.writeFile(RSS_CACHE_FILE, JSON.stringify(cache, null, 2));
    console.log("[CACHE] RSS feeds cached successfully");
  } catch (err) {
    console.error("[CACHE] Failed to cache RSS feeds:", err.message);
  }
}

// Classify topic relevance
async function classifyTopicRelevance(article, topic) {
  // Lightweight classification to avoid unnecessary GPT-4 calls
  if (!topic) return true; // No topic filter means all articles are relevant

  try {
    // Use original topic matching first (efficient)
    const topicWords = topic.split(/\s+/).filter((word) => word.length > 3);

    if (topicWords.length > 0) {
      const topicPatterns = topicWords.map((word) => new RegExp(word, "i"));
      const fullText = `${article.title} ${article.description} ${article.content}`;

      // If basic pattern matching works, return early
      if (topicPatterns.some((pattern) => pattern.test(fullText))) {
        return true;
      }
    }

    // For more accurate but costlier classification, use OpenAI
    // Only for articles that didn't match via pattern matching
    const prompt = `
      Rate the relevance of this article to the topic "${topic}" on a scale of 1-10:
      
      Title: ${sanitizeText(article.title)}
      Content: ${sanitizeText(article.description || article.content).substring(
        0,
        300
      )}
      
      Provide only a number from 1-10 as your answer.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a classifier that rates article relevance to topics. Respond only with a number from 1-10.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 10,
      temperature: 0.1,
    });

    const response = completion.choices[0].message.content.trim();
    const score = parseInt(response, 10);

    // Count this as relevant if score is 6 or higher
    return !isNaN(score) && score >= 6;
  } catch (err) {
    console.error("[CLASSIFY] Error classifying topic relevance:", err.message);
    // Fall back to basic matching if classification fails
    return true;
  }
}

async function fetchArticlesFromRSS(topic) {
  // Check cache first
  const cachedArticles = await getRssCache();
  if (cachedArticles) {
    // If we have cached articles, filter by topic and return
    const topicFiltered = [];
    for (const article of cachedArticles) {
      if (await classifyTopicRelevance(article, topic)) {
        topicFiltered.push(article);
      }
    }

    console.log(
      `[CACHE] Found ${topicFiltered.length} relevant articles for topic "${topic}"`
    );
    return topicFiltered.slice(0, 5); // Limit to top 5 articles
  }

  try {
    // Define a list of RSS feeds for different news sources with updated URLs
    const rssSources = [
      // General news
      {
        url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
        name: "New York Times",
      },
      {
        url: "https://feeds.bbci.co.uk/news/world/rss.xml",
        name: "BBC News",
      },
      {
        url: "https://www.theguardian.com/world/rss",
        name: "The Guardian",
      },
      {
        url: "https://www.npr.org/rss/rss.php?id=1004",
        name: "NPR",
      },

      // More reliable tech news
      {
        url: "https://www.theverge.com/rss/index.xml",
        name: "The Verge",
      },
      {
        url: "https://feeds.arstechnica.com/arstechnica/index",
        name: "Ars Technica",
      },

      // Business/Finance
      {
        url: "https://www.wsj.com/xml/rss/3_7085.xml",
        name: "Wall Street Journal",
      },
      {
        url: "https://www.economist.com/international/rss.xml",
        name: "The Economist",
      },
    ];

    // Add error handling timeout to fetch operations
    const fetchWithTimeout = async (url, timeout = 10000) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const feed = await parser.parseURL(url);
        clearTimeout(timeoutId);
        return feed;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    };

    // Randomly select 3-4 sources
    const selectedSources = [...rssSources]
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);

    let allArticles = [];
    let successCount = 0;

    // Fetch from each selected source
    for (const source of selectedSources) {
      try {
        console.log(`[RSS] Fetching from ${source.name}`);
        const feed = await fetchWithTimeout(source.url);
        successCount++;

        // Process the RSS feed items
        const articles = feed.items.map((item) => ({
          title: sanitizeText(item.title),
          description: sanitizeText(
            item.contentSnippet || item.content || item.summary || ""
          ),
          content: sanitizeText(
            item.content || item.contentSnippet || item.summary || ""
          ),
          url: item.link,
          publishedAt: item.pubDate || item.isoDate,
          author: item.creator || item.author || source.name,
          source: {
            name: source.name,
            url: source.url,
          },
        }));

        allArticles = allArticles.concat(articles);
      } catch (sourceErr) {
        console.error(
          `[ERROR] Failed to fetch from ${source.name}:`,
          sourceErr.message
        );
      }
    }

    console.log(
      `[RSS] Successfully fetched ${allArticles.length} articles from ${successCount}/${selectedSources.length} sources`
    );

    // Save all articles to cache for future use
    if (allArticles.length > 0) {
      await saveRssCache(allArticles);
    }

    // Filter by topic relevance
    const topicFiltered = [];
    for (const article of allArticles) {
      if (await classifyTopicRelevance(article, topic)) {
        topicFiltered.push(article);
      }
    }

    console.log(
      `[RSS] Found ${topicFiltered.length} relevant articles for topic "${topic}"`
    );

    // Sort by recency and return limited number
    return topicFiltered
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, 5);
  } catch (err) {
    console.error(
      `[ERROR] Fetching RSS feeds for topic "${topic}":`,
      err.message
    );
    return [];
  }
}

function tryParseJson(raw, title) {
  try {
    const match = raw.match(/```json\s*([\s\S]*?)\s*```/i);
    const rawJson = match ? match[1] : raw;

    const cleaned = rawJson
      .replace(/\\(?!["\\/bfnrtu])/g, "\\\\")
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/<br\s*\/?>/gi, "\n");

    const repaired = jsonrepair(cleaned);
    return JSON.parse(repaired);
  } catch (err) {
    console.error(`[ERROR] Failed to parse JSON for "${title}":`, err.message);
    console.error("[RAW OUTPUT]:", raw.slice(0, 300));
    // Advanced recovery - try to fix common JSON issues
    try {
      // Try to extract just a JSON-looking part
      const jsonPattern = /{[\s\S]*}/;
      const match = raw.match(jsonPattern);

      if (match) {
        const extracted = match[0];
        const repaired = jsonrepair(extracted);
        return JSON.parse(repaired);
      }

      // If no JSON-like structure found, create a minimal valid object
      return {
        rewritten: raw, // Use the entire raw text as content
        summary: `Article about ${title}`,
        tags: ["news"],
        topic: topics[0],
        category: "Editorial",
        citations: [
          {
            title: "Original Source",
            url: title,
          },
        ],
      };
    } catch (fallbackErr) {
      console.error("[FALLBACK ERROR]:", fallbackErr.message);
      return null;
    }
  }
}

async function rewriteArticle(article, reporter) {
  // Check token count for cost control
  const combinedText = `${article.title} ${
    article.content || article.description || ""
  }`;
  const estimatedTokens = estimateTokenCount(combinedText);

  if (estimatedTokens > 3000) {
    console.log(
      `[TOKENS] Article too long (est. ${estimatedTokens} tokens), truncating content`
    );
    // Truncate to keep costs reasonable
    article.content = article.content?.substring(0, 1500) || "";
    article.description = article.description?.substring(0, 1500) || "";
  }

  const topicList = topics.map((t) => `"${t}"`).join(", ");
  const prompt = `
  You are ${reporter.name}, ${reporter.description}.
 
  PERSONALITY:
  ${reporter.persona}
 
  WRITING STYLE:
  ${reporter.writingStyle}

  TASK:
  Rewrite the article below in your own voice and tone. Choose the most relevant topic from this list: [${topicList}].
  
  FORMAT REQUIREMENTS:
  - Write 400-600 words total
  - Structure the article with 4-5 paragraphs minimum
  - Use HTML formatting with <p> tags for paragraphs
  - Use <em> for emphasis and <strong> for important points
  - Include at least 1-2 pull quotes that encapsulate your perspective
  - Create a catchy, provocative headline that fits your voice
  - Make liberal use of your characteristic writing style elements
  - Ensure your unique personality and perspective comes through clearly
  
  Return ONLY a JSON object with these exact fields:
  - title (your catchy new headline)
  - rewritten (the full article with HTML formatting)
  - summary (30–50 words)
  - tags (array of 3–5 keywords)
  - citations (array of { title, url })
  - topic (chosen from the topics list)
  - category (one of: Politics, Finance, Editorial, Technology, Lifestyle)
  - photoCredit (attribute the original source)
  - quotes (array of objects with: { text, attribution, position: "right" or "left" or "center" })
  
  IMPORTANT: Your response will be evaluated for quality based on length, formatting, and capturing your unique voice.
  
  SOURCE ARTICLE:
  Title: ${article.title}
  Content: ${article.content || article.description || ""}
  URL: ${article.url || ""}
  Author: ${article.author || "Unknown"}
  Source: ${article.source?.name || "News Source"}
  `;

  // Use A/B testing between models
  const today = new Date();
  const dayOfMonth = today.getDate();

  // Use GPT-3.5 on certain days for cost savings (e.g., days 1-6, 15-20 of each month)
  const useGpt35 =
    (dayOfMonth >= 1 && dayOfMonth <= 6) ||
    (dayOfMonth >= 15 && dayOfMonth <= 20);

  const model = useGpt35 ? "gpt-3.5-turbo-16k" : "gpt-4";

  console.log(`[MODEL] Using ${model} for article rewrite`);

  try {
    const startTime = Date.now();

    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: "system",
          content: `You are an expert journalist with the unique voice and perspective of ${reporter.name}. You excel at transforming news stories into engaging, well-formatted articles with HTML structure and pull quotes. You never break character and always maintain the specified voice.`,
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 2000, // Adjusted for 400-600 word articles
      temperature: 0.8,
    });

    const endTime = Date.now();
    const processingTime = (endTime - startTime) / 1000;

    // Estimate cost (very rough approximation)
    const costEstimate = useGpt35
      ? 0.002 * (estimatedTokens / 1000)
      : 0.03 * (estimatedTokens / 1000);
    stats.totalCost += costEstimate;

    console.log(
      `[COST] Estimated cost: $${costEstimate.toFixed(
        4
      )} | Running total: $${stats.totalCost.toFixed(4)}`
    );
    console.log(`[TIME] Processing time: ${processingTime.toFixed(2)}s`);

    const raw = completion.choices[0].message.content.trim();
    console.log(
      `[DEBUG] Raw response for "${
        article.title
      }" (first 200 chars): ${raw.substring(0, 200)}...`
    );

    const data = tryParseJson(raw, article.title);
    // Additional validation and defaults
    if (data) {
      // Ensure all required fields exist with defaults if missing
      return {
        rewritten:
          data.rewritten || article.content || article.description || "",
        summary: data.summary || `Article about ${article.title}`,
        tags: Array.isArray(data.tags)
          ? data.tags
          : [article.source?.name || "news"],
        topic: data.topic || topics[0],
        category: data.category || "Editorial",
        quotes: Array.isArray(data.quotes) ? data.quotes : [],
        citations: Array.isArray(data.citations)
          ? data.citations
          : [
              {
                title: article.source?.name || "Original Source",
                url: article.url || "",
              },
            ],
        model: model, // Track which model was used
      };
    }
    return null;
  } catch (err) {
    console.error(
      `[ERROR] Rewrite failed for "${article.title}":`,
      err.message
    );
    return null;
  }
}

function scoreArticleQuality(data) {
  let score = 0;
  const MAX_SCORE = 100;

  // Check content length (aim for 400-600 words as per the prompt)
  const wordCount = data.rewritten.split(/\s+/).length;
  if (wordCount >= 400 && wordCount <= 600) {
    score += 25; // Increased from 20 if it matches the exact target range
  } else if (wordCount >= 300 && wordCount < 400) {
    score += 15; // Increased mid-range score
  } else if (wordCount > 600) {
    score += 10; // Still reward longer content
  }

  // Check paragraph count (aim for 4+ paragraphs)
  const paragraphCount = (data.rewritten.match(/<p>/g) || []).length;
  score += Math.min(paragraphCount * 5, 20);

  // Check for quotes
  if (data.quotes && data.quotes.length > 0) {
    score += data.quotes.length * 7; // Increased from 5
  }

  // Check for HTML formatting
  if (
    data.rewritten.includes("<p>") &&
    (data.rewritten.includes("<em>") || data.rewritten.includes("<strong>"))
  ) {
    score += 15;
  }

  // Check for citations
  if (data.citations && data.citations.length > 0) {
    score += data.citations.length * 5;
  }

  // Bonus for longer summaries
  if (data.summary && data.summary.split(/\s+/).length >= 20) {
    score += 10;
  }

  // Bonus for titles with compelling words
  const compellingWords = [
    "why",
    "how",
    "revealed",
    "exclusive",
    "secret",
    "shocking",
    "must",
    "never",
    "inside",
    "truth",
    "power",
    "fight",
    "battle",
    "war",
    "crisis",
  ];

  if (data.title) {
    const titleLower = data.title.toLowerCase();
    const matchCount = compellingWords.filter((word) =>
      titleLower.includes(word)
    ).length;
    score += matchCount * 3; // Give points for each compelling word
  }

  // Cap at 100
  return Math.min(score, MAX_SCORE);
}
// Update reporter stats after article generation
function updateReporterStats(reporter, articleData, qualityScore) {
  const reporterStats = stats.reporterStats[reporter.name];

  // Update counters
  reporterStats.articlesWritten++;

  // Update averages
  const wordCount = articleData.rewritten.split(/\s+/).length;
  reporterStats.avgWordCount =
    (reporterStats.avgWordCount * (reporterStats.articlesWritten - 1) +
      wordCount) /
    reporterStats.articlesWritten;
  reporterStats.avgQualityScore =
    (reporterStats.avgQualityScore * (reporterStats.articlesWritten - 1) +
      qualityScore) /
    reporterStats.articlesWritten;

  // Update topic coverage
  const topic = articleData.topic;
  reporterStats.topicsCovered[topic] =
    (reporterStats.topicsCovered[topic] || 0) + 1;
}

// Save stats to file
async function saveStats() {
  try {
    const statsFile = path.join(CACHE_DIR, "generator-stats.json");
    await fs.writeFile(statsFile, JSON.stringify(stats, null, 2));
    console.log("[STATS] Saved to file");
  } catch (err) {
    console.error("[STATS] Failed to save stats:", err.message);
  }
}

async function runJob() {
  // Import the email service
  const { sendArticleNotification } = require("../utils/emailService");

  // Initialize reporter stats if needed
  initReporterStats();

  // Reset job counters
  stats.articlesFetched = 0;
  stats.articlesProcessed = 0;
  stats.articlesRejected = 0;
  stats.lastUpdated = new Date();

  // Flag to track if we've already processed an article
  let articleProcessed = false;

  const selectedTopics = getRandomTopicsWithDiversity(2);
  console.log(`[CRON] Fetching topics: ${selectedTopics.join(", ")}`);

  // Loop through topics
  for (const topic of selectedTopics) {
    // If we've already processed an article, skip remaining topics
    if (articleProcessed) {
      console.log(`[CRON] Skipping topic "${topic}" - article limit reached`);
      continue;
    }

    // Fetch articles matching the topic
    const articles = await fetchArticlesFromRSS(topic);
    stats.articlesFetched += articles.length;

    console.log(
      `[CRON] Found ${articles.length} articles for topic "${topic}"`
    );

    // If no articles found, try next topic
    if (articles.length === 0) continue;

    // Process ONLY the top article by recency
    const articlesToProcess = articles.slice(0, 1); // Take only the first article

    for (const rawArticle of articlesToProcess) {
      console.log(`[CRON] Processing article: "${rawArticle.title}"`);

      // Skip duplicates
      if (await isDuplicateArticle(rawArticle)) {
        console.log(`[SKIP] Duplicate article detected: "${rawArticle.title}"`);
        stats.articlesRejected++;
        continue;
      }

      // Get reporter specialized in this topic
      const reporter = getReporterForTopic(topic);
      console.log(`[CRON] Selected reporter: ${reporter.name}`);

      // Rewrite the article
      const data = await rewriteArticle(rawArticle, reporter);

      // Skip if rewrite failed
      if (!data) {
        console.warn(
          `[SKIP] Rewrite failed completely for "${rawArticle.title}"`
        );
        stats.articlesRejected++;
        continue;
      }

      // Calculate quality score
      const qualityScore = scoreArticleQuality(data);
      console.log(`[QUALITY] Article scored: ${qualityScore}/100`);

      // Only save high-quality content
      if (qualityScore < 60) {
        console.warn(
          `[QUALITY] Article rejected due to low score: ${qualityScore}/100`
        );
        stats.articlesRejected++;
        continue;
      }

      try {
        // Create article with all possible fields
        const savedArticle = await Article.create({
          title: data.title || rawArticle.title,
          original: rawArticle.content || rawArticle.description || "",
          content: data.rewritten,
          summary: data.summary,
          tags: data.tags,
          citations: data.citations || [
            {
              title: rawArticle.source?.name || "Original Source",
              url: rawArticle.url || "",
            },
          ],
          author: reporter.name,
          voiceId: reporter.voiceId,
          topic: data.topic,
          category: data.category || "Editorial",
          sourceUrl: rawArticle.url,
          photoCredit: data.photoCredit || rawArticle.source?.name || "",
          quotes: data.quotes || [],
          status: "draft",
          createdAt: new Date(),
        });

        // Update reporter statistics
        try {
          updateReporterStats(reporter, data, qualityScore);
        } catch (statsError) {
          console.error(
            `[STATS ERROR] Failed to update reporter stats: ${statsError.message}`
          );
          // Continue processing even if stats update fails
        }

        stats.articlesProcessed++;
        articleProcessed = true; // Mark that we've processed an article

        console.log(
          `[CRON] ✅ Staged article by ${reporter.name}: "${
            data.title || rawArticle.title
          }"`
        );

        // Send email notification about the new article
        try {
          await sendArticleNotification(savedArticle, reporter);
          console.log(
            `[EMAIL] Notification sent for article "${savedArticle.title}"`
          );
        } catch (emailErr) {
          console.error(
            `[EMAIL] Failed to send notification: ${emailErr.message}`
          );
        }

        // Break out of the loop once we've processed one article
        break;
      } catch (err) {
        console.error(
          `[ERROR] Failed to save article "${rawArticle.title}":`,
          err.message
        );
        stats.articlesRejected++;

        // Log the exact Mongoose validation error for debugging
        if (err.name === "ValidationError") {
          for (const field in err.errors) {
            console.error(`- ${field}: ${err.errors[field].message}`);
          }
        }
      }
    }

    // If we've processed an article, no need to check more topics
    if (articleProcessed) {
      console.log(`[CRON] Article limit reached, stopping processing`);
      break;
    }
  }

  // Save stats at the end of job
  await saveStats();

  console.log(`[CRON] Job Summary:
    Topics: ${selectedTopics.join(", ")}
    Articles fetched: ${stats.articlesFetched}
    Articles processed: ${stats.articlesProcessed}
    Articles rejected: ${stats.articlesRejected}
    Estimated cost: ${stats.totalCost.toFixed(4)}
  `);
}

function scheduleJobs() {
  // Initialize cache when the server starts
  initializeCache();

  // Schedule to run at 6am and 12pm Mountain Time (12pm and 6pm UTC during DST)
  cron.schedule("0 12,18 * * *", async () => {
    try {
      console.log("[CRON] Scheduled job running...");
      await runJob();
      console.log("[CRON] Job complete.");
    } catch (err) {
      console.error("[CRON ERROR]:", err.message);
    }
  });

  console.log("[CRON] Job scheduled to run at 6am and 12pm Mountain Time");
}

module.exports = {
  scheduleJobs,
  runJob,
};
