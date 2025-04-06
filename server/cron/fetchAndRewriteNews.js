const cron = require("node-cron");
const axios = require("axios");
const OpenAI = require("openai");
const { jsonrepair } = require("jsonrepair");
const topics = require("../utils/topics");
const Article = require("../models/Article");
const reporters = require("../utils/reporters");
const Parser = require("rss-parser");
const parser = new Parser();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function getRandomTopics(count = 2) {
  return [...topics].sort(() => 0.5 - Math.random()).slice(0, count);
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

async function fetchArticlesFromRSS(topic) {
  try {
    // Define a list of RSS feeds for different news sources with updated URLs
    const rssSources = [
      // General news
      {
        url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", // More specific NYT feed
        name: "New York Times",
      },
      {
        url: "https://feeds.bbci.co.uk/news/world/rss.xml", // Use world news feed
        name: "BBC News",
      },
      {
        url: "https://www.theguardian.com/world/rss",
        name: "The Guardian",
      },
      {
        url: "https://www.npr.org/rss/rss.php?id=1004", // NPR world news feed
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
        url: "https://www.wsj.com/xml/rss/3_7085.xml", // WSJ world news
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

    // Randomly select 3-4 sources (increased from 2-3)
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
          title: item.title,
          description:
            item.contentSnippet || item.content || item.summary || "",
          content: item.content || item.contentSnippet || item.summary || "",
          url: item.link,
          publishedAt: item.pubDate || item.isoDate,
          author: item.creator || item.author || source.name,
          source: {
            name: source.name,
            url: source.url,
          },
        }));

        // Make topic matching more flexible
        let filteredArticles = articles;

        if (topic) {
          // Create a more flexible regex by breaking the topic into words
          const topicWords = topic
            .split(/\s+/)
            .filter((word) => word.length > 3);

          // If we have meaningful words, create regex patterns for each
          if (topicWords.length > 0) {
            // Match any of the significant words in the topic
            const topicPatterns = topicWords.map(
              (word) => new RegExp(word, "i")
            );

            filteredArticles = articles.filter((article) => {
              const fullText = `${article.title} ${article.description} ${article.content}`;
              // Article matches if any significant word is found
              return topicPatterns.some((pattern) => pattern.test(fullText));
            });
          }
        }

        console.log(
          `[RSS] Found ${filteredArticles.length} matching articles from ${source.name}`
        );

        // Take up to 2 matching articles from each source
        if (filteredArticles.length > 0) {
          allArticles = allArticles.concat(filteredArticles.slice(0, 2));
        }
      } catch (sourceErr) {
        console.error(
          `[ERROR] Failed to fetch from ${source.name}:`,
          sourceErr.message
        );
      }
    }

    console.log(
      `[RSS] Successfully fetched from ${successCount}/${selectedSources.length} sources`
    );
    console.log(
      `[RSS] Found ${allArticles.length} total articles for topic "${topic}"`
    );

    // If we found no articles with the exact topic, use a fallback approach
    if (allArticles.length === 0 && successCount > 0) {
      console.log(
        `[RSS] No exact matches found for "${topic}". Using recent articles instead.`
      );

      // Get most recent articles from the successful feeds
      const recentArticles = [];
      for (const source of selectedSources) {
        try {
          const feed = await fetchWithTimeout(source.url);
          // Just take the most recent article
          if (feed.items && feed.items.length > 0) {
            const mostRecent = feed.items[0];
            recentArticles.push({
              title: mostRecent.title,
              description:
                mostRecent.contentSnippet ||
                mostRecent.content ||
                mostRecent.summary ||
                "",
              content:
                mostRecent.content ||
                mostRecent.contentSnippet ||
                mostRecent.summary ||
                "",
              url: mostRecent.link,
              publishedAt: mostRecent.pubDate || mostRecent.isoDate,
              author: mostRecent.creator || mostRecent.author || source.name,
              source: {
                name: source.name,
                url: source.url,
              },
            });
          }
        } catch (err) {
          // Skip failed sources in fallback
        }
      }

      return recentArticles.slice(0, 2); // Return up to 2 recent articles as fallback
    }

    return allArticles;
  } catch (err) {
    console.error(
      `[ERROR] Fetching RSS feeds for topic "${topic}":`,
      err.message
    );
    return [];
  }
}

async function rewriteArticle(article, reporter) {
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

  // Choose model based on article complexity
  const wordCount = (article.content || article.description || "").split(
    /\s+/
  ).length;

  // Always use GPT-4 for better quality
  const model = "gpt-4";

  console.log(`[MODEL] Using ${model} for article with ${wordCount} words`);
  try {
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

async function runJob() {
  const selectedTopics = getRandomTopicsWithDiversity(); // Use the diversity-aware function
  console.log(`[CRON] Fetching topics: ${selectedTopics.join(", ")}`);

  for (const topic of selectedTopics) {
    const articles = await fetchArticlesFromRSS(topic); // Fetch articles from RSS
    console.log(
      `[CRON] Found ${articles.length} articles for topic "${topic}"`
    );

    for (const rawArticle of articles) {
      console.log(`[CRON] Processing article: "${rawArticle.title}"`);

      // Use the diversity-aware reporter selection
      const reporter = getRandomReporter();
      console.log(`[CRON] Selected reporter: ${reporter.name}`);

      const data = await rewriteArticle(rawArticle, reporter);

      if (!data) {
        console.warn(
          `[SKIP] Rewrite failed completely for "${rawArticle.title}"`
        );
        continue;
      }

      // Calculate quality score instead of just checking missing fields
      const qualityScore = scoreArticleQuality(data);
      console.log(`[QUALITY] Article scored: ${qualityScore}/100`);

      // Only save high-quality content
      if (qualityScore < 60) {
        console.warn(
          `[QUALITY] Article rejected due to low score: ${qualityScore}/100`
        );
        continue;
      }

      try {
        // Create article with all possible fields, providing defaults for missing ones
        await Article.create({
          title: rawArticle.title,
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

        console.log(
          `[CRON] ✅ Staged article by ${reporter.name}: "${rawArticle.title}"`
        );
      } catch (err) {
        console.error(
          `[ERROR] Failed to save article "${rawArticle.title}":`,
          err.message
        );
        // Log the exact Mongoose validation error for debugging
        if (err.name === "ValidationError") {
          for (const field in err.errors) {
            console.error(`- ${field}: ${err.errors[field].message}`);
          }
        }
      }
    }
  }
}

function scheduleJobs() {
  cron.schedule("0 8,18 * * *", async () => {
    try {
      console.log("[CRON] Scheduled job running...");
      await runJob();
      console.log("[CRON] Job complete.");
    } catch (err) {
      console.error("[CRON ERROR]:", err.message);
    }
  });
  console.log("[CRON] Job scheduled to run at 8am and 6pm UTC");
}

// In server/cron/fetchAndRewriteNews.js

// Track which reporters and topics were recently used
let recentReporters = [];
let recentTopics = [];

function getRandomReporter() {
  // Filter out recently used reporters for variety
  const availableReporters = reporters.filter(
    (reporter) => !recentReporters.includes(reporter.name)
  );

  // If all reporters were recently used, reset the tracking
  const reporterPool =
    availableReporters.length > 0 ? availableReporters : reporters;

  // Select a random reporter
  const reporter =
    reporterPool[Math.floor(Math.random() * reporterPool.length)];

  // Update tracking (keep last 3)
  recentReporters.push(reporter.name);
  if (recentReporters.length > 3) {
    recentReporters.shift();
  }

  return reporter;
}

// Similar function for topics
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

function scoreArticleQuality(data) {
  let score = 0;
  const MAX_SCORE = 100;

  // Check content length (aim for 500-1500 words)
  const wordCount = data.rewritten.split(/\s+/).length;
  if (wordCount >= 500 && wordCount <= 1500) {
    score += 20;
  } else if (wordCount > 300) {
    score += 10;
  }

  // Check paragraph count (aim for 4+ paragraphs)
  const paragraphCount = (data.rewritten.match(/<p>/g) || []).length;
  score += Math.min(paragraphCount * 5, 20);

  // Check for quotes
  if (data.quotes && data.quotes.length > 0) {
    score += data.quotes.length * 5;
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

  // Cap at 100
  return Math.min(score, MAX_SCORE);
}

module.exports = {
  scheduleJobs,
  runJob,
};
