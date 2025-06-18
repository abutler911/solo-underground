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

// Enhanced Configuration with improved defaults and topic-specific subreddit mapping
const CONFIG = {
  REDDIT_SUBREDDITS: (process.env.REDDIT_SUBREDDITS || "")
    .split(",")
    .filter(Boolean),
  REDDIT_POST_LIMIT: parseInt(process.env.REDDIT_POST_LIMIT) || 25,
  CACHE_EXPIRY_HOURS: parseInt(process.env.RSS_CACHE_EXPIRY_HOURS) || 0,
  SMART_REFRESH_HOURS: parseInt(process.env.RSS_SMART_REFRESH_HOURS) || 0,
  ARTICLES_PER_TOPIC: parseInt(process.env.ARTICLES_PER_TOPIC) || 4,
  TOPICS_PER_RUN: parseInt(process.env.TOPICS_PER_RUN) || 2,
  MIN_QUALITY_SCORE: parseInt(process.env.MIN_QUALITY_SCORE) || 65,
  MIN_WORD_COUNT: parseInt(process.env.MIN_WORD_COUNT) || 400,
  BONUS_WORD_COUNT: parseInt(process.env.BONUS_WORD_COUNT) || 500,
  MIN_PARAGRAPHS: parseInt(process.env.MIN_PARAGRAPHS) || 4,
  OPENAI_MODEL: process.env.OPENAI_MODEL || "gpt-4",
  OPENAI_TEMPERATURE: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.3,
  MAX_RETRIES: parseInt(process.env.MAX_RETRIES) || 3,
  RETRY_DELAY_MS: parseInt(process.env.RETRY_DELAY_MS) || 1000,
  RSS_FEEDS: (process.env.RSS_FEEDS || "").split(",").filter(Boolean),
  CRON_SCHEDULES: (
    process.env.CRON_SCHEDULES || "0 6,9,12,15,18,21,0,3 * * *"
  ).split(","),

  // Enhanced subreddit configuration
  DEFAULT_SUBREDDITS: [
    "politics",
    "worldnews",
    "TrueReddit",
    "NeutralPolitics",
    "moderatepolitics",
    "inthenews",
    "qualitynews",
    "technology",
    "privacy",
    "cybersecurity",
    "Futurology",
    "MachineLearning",
    "singularity",
    "Economics",
    "LateStageCapitalism",
    "investing",
    "CryptoCurrency",
    "wallstreetbets",
    "antiwork",
    "ABoringDystopia",
    "collapse",
    "environment",
    "conspiracy",
    "HighStrangeness",
    "undelete",
    "geopolitics",
    "ukpolitics",
    "europe",
    "preppers",
    "Survival",
    "SelfSufficiency",
  ],

  // Topic-specific subreddit mapping
  TOPIC_SUBREDDITS: {
    "US politics": [
      "politics",
      "Conservative",
      "progressive",
      "Libertarian",
      "moderatepolitics",
    ],
    "surveillance state": [
      "privacy",
      "cybersecurity",
      "conspiracy",
      "stallmanwasright",
    ],
    "AI ethics": ["MachineLearning", "artificial", "singularity", "technology"],
    "climate policy": [
      "environment",
      "climatechange",
      "Green",
      "sustainability",
    ],
    cryptocurrency: ["CryptoCurrency", "Bitcoin", "crypto", "wallstreetbets"],
    "labor rights": [
      "antiwork",
      "LateStageCapitalism",
      "socialism",
      "WorkReform",
    ],
    "conspiracy theories": [
      "conspiracy",
      "HighStrangeness",
      "C_S_T",
      "conspiracy_commons",
    ],
    "collapse preparedness": [
      "preppers",
      "Survival",
      "collapse",
      "PostCollapse",
    ],
    "tech regulation": ["technology", "privacy", "netsec", "TechNewsToday"],
    "global economy": [
      "Economics",
      "investing",
      "economy",
      "financialindependence",
    ],
    "foreign affairs": [
      "geopolitics",
      "worldnews",
      "internationalpolitics",
      "europe",
    ],
    "military industrial complex": [
      "Military",
      "EndlessWar",
      "geopolitics",
      "conspiracy",
    ],
    "free speech": ["FreeSpeech", "censorship", "WatchRedditDie", "undelete"],
    "media bias": [
      "media_criticism",
      "journalism",
      "TrueReddit",
      "qualitynews",
    ],
    "civil unrest": ["PublicFreakout", "news", "politics", "Bad_Cop_No_Donut"],
    "misinformation & propaganda": [
      "PropagandaPosters",
      "MediaSynthesis",
      "conspiracy",
    ],
    "culture wars": [
      "KotakuInAction",
      "TumblrInAction",
      "SocialJusticeInAction",
    ],
    "digital privacy": ["privacy", "privacytoolsIO", "cybersecurity", "netsec"],
    "mental health crisis": [
      "mentalhealth",
      "depression",
      "anxiety",
      "psychology",
    ],
    "income inequality": [
      "LateStageCapitalism",
      "antiwork",
      "povertyfinance",
      "Economics",
    ],
    "corporate overreach": [
      "LateStageCapitalism",
      "ABoringDystopia",
      "conspiracy",
    ],
    "automation & jobs": [
      "Futurology",
      "antiwork",
      "technology",
      "singularity",
    ],
    "biohacking & longevity": [
      "longevity",
      "biohackers",
      "Nootropics",
      "singularity",
    ],
    "space colonization": ["SpaceX", "space", "Mars", "Futurology"],
    "deep learning": [
      "MachineLearning",
      "artificial",
      "deeplearning",
      "singularity",
    ],
    "quantum computing": ["quantum", "Physics", "technology", "Futurology"],
    "water scarcity": [
      "environment",
      "collapse",
      "ClimateChange",
      "sustainability",
    ],
    "environmental collapse": [
      "collapse",
      "environment",
      "ClimateChange",
      "Green",
    ],
    "post-capitalist transition": [
      "socialism",
      "communism",
      "LateStageCapitalism",
      "antiwork",
    ],
    "election integrity": [
      "politics",
      "conspiracy",
      "Conservative",
      "progressive",
    ],
    "shadow governance": [
      "conspiracy",
      "DeepStateWatch",
      "geopolitics",
      "HighStrangeness",
    ],
    "prison industrial complex": ["Bad_Cop_No_Donut", "politics", "socialism"],
    "whistleblower suppression": [
      "WikiLeaks",
      "conspiracy",
      "privacy",
      "FreeSpeech",
    ],
    "disaster capitalism": [
      "LateStageCapitalism",
      "conspiracy",
      "Economics",
      "collapse",
    ],
    "medical freedom": ["conspiracy", "DebateVaccines", "LockdownSkepticism"],
    "pharmaceutical corruption": [
      "conspiracy",
      "BigPharma",
      "DebateVaccines",
      "medicine",
    ],
    "racial justice": [
      "BlackPeopleTwitter",
      "racism",
      "politics",
      "socialjustice",
    ],
    "gender politics": [
      "TwoXChromosomes",
      "MensRights",
      "GenderCritical",
      "politics",
    ],
    "reproductive rights": [
      "TwoXChromosomes",
      "prochoice",
      "politics",
      "abortion",
    ],
    "LGBTQ+ rights": ["lgbt", "ainbow", "transgender", "politics"],
    "financial crimes": [
      "investing",
      "wallstreetbets",
      "SecurityAnalysis",
      "Economics",
    ],
    "market manipulation": [
      "wallstreetbets",
      "investing",
      "superstonk",
      "Economics",
    ],
    "central banking": ["Economics", "Bitcoin", "investing", "conspiracy"],
    "algorithmic governance": [
      "technology",
      "privacy",
      "Futurology",
      "conspiracy",
    ],
    "smart cities": ["technology", "privacy", "urbanism", "conspiracy"],
    "digital ID systems": [
      "privacy",
      "conspiracy",
      "technology",
      "cybersecurity",
    ],
    "predictive policing": [
      "Bad_Cop_No_Donut",
      "privacy",
      "technology",
      "conspiracy",
    ],
    "social credit systems": ["privacy", "conspiracy", "technology", "China"],
    "machine learning bias": [
      "MachineLearning",
      "technology",
      "privacy",
      "artificial",
    ],
    "automation economics": [
      "Economics",
      "Futurology",
      "antiwork",
      "technology",
    ],
    "grid failure": ["preppers", "collapse", "energy", "conspiracy"],
    "supply chain collapse": ["preppers", "collapse", "economy", "conspiracy"],
    "food security": ["preppers", "collapse", "gardening", "homesteading"],
    "water security": ["preppers", "collapse", "environment", "conspiracy"],
    "energy security": ["energy", "preppers", "collapse", "geopolitics"],
    "cyber attacks": ["cybersecurity", "netsec", "technology", "conspiracy"],
    "natural disasters": ["preppers", "collapse", "climate", "environment"],
    "community resilience": [
      "preppers",
      "collapse",
      "homesteading",
      "SelfSufficiency",
    ],
    "self-sufficiency": [
      "preppers",
      "homesteading",
      "SelfSufficiency",
      "collapse",
    ],
    survivalism: ["preppers", "Survival", "collapse", "SelfSufficiency"],
    "prepper movement": ["preppers", "Survival", "collapse", "SelfSufficiency"],
  },
};

const SUB_CLEAN = /[^a-z0-9_]/gi;
CONFIG.REDDIT_SUBREDDITS = CONFIG.REDDIT_SUBREDDITS.map((s) =>
  s.trim().replace(SUB_CLEAN, "")
).filter(Boolean);

// Validate required environment variables
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is required");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "NewsBot/2.0",
  },
});

// Cache directory setup
const CACHE_DIR = path.join(__dirname, "../cache");
const RSS_CACHE_FILE = path.join(CACHE_DIR, "rss-cache.json");
const STATS_FILE = path.join(CACHE_DIR, "generator-stats.json");
const REJECTED_DIR = path.join(CACHE_DIR, "rejected");

// Enhanced stats tracking
let stats = {
  articlesFetched: 0,
  articlesProcessed: 0,
  articlesRejected: 0,
  totalCost: 0,
  apiCalls: 0,
  reporterStats: {},
  lastUpdated: new Date(),
  errors: [],
  performance: {
    avgProcessingTime: 0,
    totalRuns: 0,
  },
};

// Track recent selections for diversity
let recentReporters = [];
let recentTopics = [];

// Enhanced logging utility
class Logger {
  static log(level, component, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      component,
      message,
      ...(data && { data }),
    };
    console.log(
      `[${logEntry.level}] [${component}] ${message}`,
      data ? JSON.stringify(data, null, 2) : ""
    );
  }

  static info(component, message, data) {
    this.log("info", component, message, data);
  }
  static warn(component, message, data) {
    this.log("warn", component, message, data);
  }
  static error(component, message, data) {
    this.log("error", component, message, data);
  }
  static debug(component, message, data) {
    this.log("debug", component, message, data);
  }
}

// Enhanced error handling
class RetryableError extends Error {
  constructor(message, retryable = true) {
    super(message);
    this.retryable = retryable;
  }
}

async function withRetry(
  operation,
  maxRetries = CONFIG.MAX_RETRIES,
  delayMs = CONFIG.RETRY_DELAY_MS
) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (!error.retryable || attempt === maxRetries) {
        throw error;
      }

      Logger.warn(
        "RETRY",
        `Attempt ${attempt}/${maxRetries} failed, retrying in ${delayMs}ms`,
        { error: error.message }
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }

  throw lastError;
}

// Enhanced subreddit selection
function getSubredditsForTopic(topic) {
  const topicSubreddits = CONFIG.TOPIC_SUBREDDITS[topic];

  if (topicSubreddits && topicSubreddits.length > 0) {
    const generalSubs = CONFIG.DEFAULT_SUBREDDITS.slice(0, 3);
    return [...topicSubreddits, ...generalSubs];
  }

  return CONFIG.DEFAULT_SUBREDDITS;
}

// Enhanced Reddit fetching
async function fetchPostsFromReddit(subreddits, topic = null) {
  const allPosts = [];

  let targetSubreddits = subreddits;
  if (topic && subreddits.length === 0) {
    targetSubreddits = getSubredditsForTopic(topic);
  }

  const limitedSubreddits = targetSubreddits.slice(0, 15);

  const fetchPromises = limitedSubreddits.map(async (sub) => {
    const url = `https://www.reddit.com/r/${sub.trim()}/hot.json?limit=${
      CONFIG.REDDIT_POST_LIMIT
    }`;
    try {
      Logger.debug("REDDIT", `Fetching ${url}`);
      const { data } = await axios.get(url, {
        timeout: 10000,
        headers: { "User-Agent": "NewsAnalysisBot/2.0" },
      });

      const posts = (data.data.children || [])
        .map(({ data: p }) => ({
          title: p.title,
          description: p.selftext?.slice(0, 450) || "",
          content: p.selftext || "",
          url: `https://www.reddit.com${p.permalink}`,
          pubDate: new Date(p.created_utc * 1000).toUTCString(),
          source: { name: `r/${sub}` },
          upvotes: p.ups,
          comments: p.num_comments,
          awards: p.total_awards_received,
        }))
        .filter(
          (p) =>
            !p.title.startsWith("[META]") &&
            p.description.length > 50 &&
            p.upvotes > 10
        );

      Logger.info(
        "REDDIT",
        `Fetched ${posts.length} quality posts from r/${sub}`
      );
      return posts;
    } catch (err) {
      Logger.warn("REDDIT", `Failed fetching r/${sub}`, { error: err.message });
      return [];
    }
  });

  const results = await Promise.allSettled(fetchPromises);
  results.forEach(
    (res) => res.status === "fulfilled" && allPosts.push(...res.value)
  );

  return allPosts.sort(
    (a, b) => b.upvotes + b.comments - (a.upvotes + a.comments)
  );
}

// Initialize cache and directories
async function initializeDirectories() {
  try {
    await Promise.all([
      fs.mkdir(CACHE_DIR, { recursive: true }),
      fs.mkdir(REJECTED_DIR, { recursive: true }),
    ]);
    Logger.info("CACHE", "Directories initialized successfully");
  } catch (err) {
    Logger.error("CACHE", "Failed to initialize directories", {
      error: err.message,
    });
    throw new RetryableError(
      `Cache initialization failed: ${err.message}`,
      false
    );
  }
}

// Enhanced reporter stats initialization
function initReporterStats() {
  for (const reporter of reporters) {
    if (!stats.reporterStats[reporter.name]) {
      stats.reporterStats[reporter.name] = {
        articlesWritten: 0,
        avgQualityScore: 0,
        avgWordCount: 0,
        avgProcessingTime: 0,
        topicsCovered: {},
        lastUsed: null,
        perTopicScore: {},
        successRate: 100,
        totalAttempts: 0,
        errors: [],
      };
    }
  }
}

// Improved topic selection with better diversity
function getRandomTopicsWithDiversity(count = CONFIG.TOPICS_PER_RUN) {
  const availableTopics = topics.filter(
    (topic) => !recentTopics.includes(topic)
  );
  const topicPool = availableTopics.length >= count ? availableTopics : topics;

  const selectedTopics = [...topicPool]
    .sort(() => 0.5 - Math.random())
    .slice(0, count);

  recentTopics = [...recentTopics, ...selectedTopics].slice(
    -Math.max(8, topics.length * 0.3)
  );

  Logger.info("TOPICS", `Selected topics with diversity`, {
    selectedTopics,
    recentTopics,
  });
  return selectedTopics;
}

// Enhanced reporter selection
function getReporterForTopic(topic) {
  const specialized = reporters.filter((r) =>
    r.topics?.some(
      (t) =>
        t.toLowerCase() === topic.toLowerCase() ||
        topic.toLowerCase().includes(t.toLowerCase()) ||
        t.toLowerCase().includes(topic.toLowerCase())
    )
  );

  const available = (specialized.length > 0 ? specialized : reporters).filter(
    (r) => !recentReporters.includes(r.name)
  );

  const finalPool = available.length > 0 ? available : reporters;

  const weighted = finalPool.map((rep) => {
    let weight = stats.reporterStats[rep.name]?.avgQualityScore || 50;

    if (specialized.includes(rep)) {
      weight *= 1.5;
    }

    const last = stats.reporterStats[rep.name]?.lastUsed;
    if (last) {
      const hoursAgo = (Date.now() - new Date(last)) / 36e5;
      weight *= Math.max(0.4, Math.exp(-hoursAgo / 24));
    }

    return { reporter: rep, weight };
  });

  const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of weighted) {
    random -= item.weight;
    if (random <= 0) {
      const reporter = item.reporter;

      recentReporters.push(reporter.name);
      if (recentReporters.length > Math.min(4, reporters.length - 1)) {
        recentReporters.shift();
      }

      stats.reporterStats[reporter.name].lastUsed = new Date();
      Logger.info("REPORTER", `Selected reporter for topic`, {
        reporter: reporter.name,
        topic,
        specialized: specialized.includes(reporter),
        weight: Math.round(item.weight),
      });
      return reporter;
    }
  }

  return finalPool[0];
}

// Enhanced text sanitization
function sanitizeText(text, maxLength = 1500) {
  if (!text) return "";

  return text
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/[^\x00-\x7F]/g, "")
    .trim()
    .substring(0, maxLength);
}

// Enhanced duplicate detection
async function isDuplicateArticle(article) {
  try {
    const exactMatch = await Article.findOne({ sourceUrl: article.url });
    if (exactMatch) {
      Logger.debug("DEDUP", "Found exact URL match", { url: article.url });
      return true;
    }

    const normalizedTitle = article.title
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (normalizedTitle.length < 10) {
      Logger.warn("DEDUP", "Title too short for reliable duplicate detection", {
        title: article.title,
      });
      return false;
    }

    const titleWords = normalizedTitle
      .split(" ")
      .filter((word) => word.length > 3);
    if (titleWords.length === 0) return false;

    const searchPattern = titleWords.slice(0, 3).join(".*");

    const similarArticles = await Article.find({
      $or: [
        { title: { $regex: searchPattern, $options: "i" } },
        { original: { $regex: searchPattern, $options: "i" } },
      ],
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    }).limit(5);

    const isDuplicate = similarArticles.length > 0;
    if (isDuplicate) {
      Logger.debug("DEDUP", "Found similar article", {
        originalTitle: article.title,
        similarCount: similarArticles.length,
      });
    }

    return isDuplicate;
  } catch (err) {
    Logger.error("DEDUP", "Error in duplicate detection", {
      error: err.message,
    });
    return false;
  }
}

// Enhanced RSS cache management
async function getRssCache() {
  try {
    const data = await fs.readFile(RSS_CACHE_FILE, "utf8");
    const cache = JSON.parse(data);

    const cacheTime = new Date(cache.timestamp);
    const now = new Date();
    const hoursSinceCache = (now - cacheTime) / (1000 * 60 * 60);

    const shouldUseCache =
      hoursSinceCache < CONFIG.CACHE_EXPIRY_HOURS ||
      (hoursSinceCache < CONFIG.SMART_REFRESH_HOURS &&
        stats.articlesProcessed > 0);

    if (shouldUseCache) {
      Logger.info(
        "CACHE",
        `Using RSS cache from ${hoursSinceCache.toFixed(1)} hours ago`
      );
      return cache.articles;
    }

    Logger.info("CACHE", "Cache expired or refresh triggered");
    return null;
  } catch (err) {
    Logger.info("CACHE", "No valid cache found, will fetch fresh RSS feeds");
    return null;
  }
}

async function saveRssCache(articles) {
  try {
    const cache = {
      timestamp: new Date(),
      articles: articles,
      metadata: {
        totalArticles: articles.length,
        sources: [
          ...new Set(articles.map((a) => a.source?.name).filter(Boolean)),
        ],
      },
    };

    await fs.writeFile(RSS_CACHE_FILE, JSON.stringify(cache, null, 2));
    Logger.info("CACHE", `RSS feeds cached successfully`, {
      articleCount: articles.length,
    });
  } catch (err) {
    Logger.error("CACHE", "Failed to cache RSS feeds", { error: err.message });
  }
}

// Enhanced topic relevance classification
async function classifyTopicRelevance(article, topic) {
  try {
    const topicWords = topic
      .toLowerCase()
      .replace(/[-&]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2);

    const content = `${article.title || ""} ${article.description || ""} ${
      article.content || ""
    }`.toLowerCase();

    let keywordMatches = 0;
    let partialMatches = 0;

    for (const keyword of topicWords) {
      if (content.includes(keyword)) {
        keywordMatches++;
      } else {
        const stem = keyword.substring(0, Math.max(3, keyword.length - 2));
        if (content.includes(stem)) {
          partialMatches += 0.5;
        }
      }
    }

    const totalMatches = keywordMatches + partialMatches;
    const keywordRelevance = totalMatches / topicWords.length;

    if (keywordRelevance >= 0.2) {
      Logger.debug("CLASSIFY", "Quick keyword match found", {
        topic,
        keywordRelevance: keywordRelevance.toFixed(2),
      });
      return true;
    }

    const topicSynonyms = {
      environmental: [
        "climate",
        "green",
        "pollution",
        "sustainability",
        "ecology",
        "carbon",
        "emissions",
      ],
      collapse: [
        "crisis",
        "disaster",
        "emergency",
        "catastrophe",
        "breakdown",
        "failure",
      ],
      water: ["drought", "flooding", "river", "lake", "ocean", "sea", "rain"],
      scarcity: ["shortage", "limited", "depleted", "insufficient", "lacking"],
      political: [
        "government",
        "politician",
        "election",
        "vote",
        "democracy",
        "congress",
        "senate",
      ],
      economic: [
        "economy",
        "financial",
        "money",
        "market",
        "trade",
        "inflation",
        "recession",
      ],
      surveillance: [
        "monitoring",
        "tracking",
        "spying",
        "watching",
        "observation",
        "privacy",
      ],
      artificial: [
        "ai",
        "machine",
        "robot",
        "automated",
        "algorithm",
        "neural",
        "deep",
      ],
      medical: [
        "health",
        "hospital",
        "doctor",
        "medicine",
        "disease",
        "treatment",
        "vaccine",
      ],
      technology: [
        "tech",
        "digital",
        "cyber",
        "computer",
        "internet",
        "software",
        "data",
      ],
      military: [
        "war",
        "defense",
        "army",
        "soldier",
        "weapon",
        "combat",
        "conflict",
      ],
      corporate: [
        "business",
        "company",
        "corporation",
        "profit",
        "enterprise",
        "commercial",
      ],
      social: [
        "society",
        "community",
        "cultural",
        "people",
        "public",
        "citizen",
      ],
      legal: ["law", "court", "judge", "justice", "legal", "crime", "police"],
    };

    let synonymMatches = 0;
    for (const word of topicWords) {
      if (topicSynonyms[word]) {
        for (const synonym of topicSynonyms[word]) {
          if (content.includes(synonym)) {
            synonymMatches++;
            break;
          }
        }
      }
    }

    const synonymRelevance = synonymMatches / topicWords.length;
    if (synonymRelevance >= 0.2) {
      Logger.debug("CLASSIFY", "Synonym match found", {
        topic,
        synonymRelevance: synonymRelevance.toFixed(2),
      });
      return true;
    }

    if (keywordRelevance > 0.1 || synonymRelevance > 0.1) {
      const prompt = `Rate the relevance of this article to the topic "${topic}" on a scale of 1-10.
      
      Article Title: ${sanitizeText(article.title)}
      Article Content: ${sanitizeText(
        article.description || article.content || ""
      ).substring(0, 300)}
      
      Consider both direct matches and thematic relevance. Respond with only a number from 1-10.`;

      const completion = await withRetry(async () => {
        return await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are a content classifier. Respond only with a number from 1-10.",
            },
            { role: "user", content: prompt },
          ],
          max_tokens: 10,
          temperature: 0.1,
        });
      });

      stats.apiCalls++;
      const scoreText = completion.choices[0].message.content.trim();
      const score = parseInt(scoreText, 10);

      if (!isNaN(score)) {
        Logger.debug("CLASSIFY", "AI classification completed", {
          topic,
          score,
        });
        return score >= 5;
      }
    }

    Logger.debug("CLASSIFY", "Low relevance, rejecting article", {
      topic,
      keywordRelevance: keywordRelevance.toFixed(2),
      synonymRelevance: synonymRelevance.toFixed(2),
    });
    return false;
  } catch (err) {
    Logger.error("CLASSIFY", "Classification error, defaulting to accept", {
      error: err.message,
    });
    return true;
  }
}

// Enhanced article fetching
async function fetchArticles(topic) {
  const topicSubreddits = getSubredditsForTopic(topic);
  const redditPromise =
    topicSubreddits.length > 0
      ? fetchPostsFromReddit(topicSubreddits, topic)
      : Promise.resolve([]);

  let rssArticles = [];
  const cached = await getRssCache();
  if (cached) {
    rssArticles = cached;
    Logger.info("RSS", "Loaded articles from cache", { count: cached.length });
  } else {
    rssArticles = await fetchRSSFeeds();
    if (rssArticles.length) await saveRssCache(rssArticles);
  }

  const redditPosts = await redditPromise;
  Logger.info(
    "REDDIT",
    `Fetched ${redditPosts.length} Reddit posts for topic: ${topic}`
  );

  const relevant = [];
  for (const art of [...rssArticles, ...redditPosts]) {
    if (await classifyTopicRelevance(art, topic)) relevant.push(art);
  }

  Logger.info(
    "FETCH",
    `Found ${relevant.length} relevant articles for '${topic}' (${rssArticles.length} RSS + ${redditPosts.length} Reddit)`
  );

  const redditRelevant = relevant.filter((a) =>
    a.source?.name?.startsWith("r/")
  );
  const otherRelevant = relevant.filter(
    (a) => !a.source?.name?.startsWith("r/")
  );

  redditRelevant.sort(
    (a, b) => b.upvotes + b.comments - (a.upvotes + a.comments)
  );
  otherRelevant.sort(() => 0.5 - Math.random());

  return [...redditRelevant, ...otherRelevant].slice(
    0,
    CONFIG.ARTICLES_PER_TOPIC * 3
  );

  async function fetchRSSFeeds() {
    const all = [];
    const feeds =
      CONFIG.RSS_FEEDS.length > 0
        ? CONFIG.RSS_FEEDS
        : [
            "https://rss.cnn.com/rss/edition.rss",
            "https://feeds.bbci.co.uk/news/world/rss.xml",
            "https://rss.reuters.com/reuters/worldNews",
            "https://feeds.npr.org/1001/rss.xml",
            "https://www.theguardian.com/world/rss",
            "https://www.aljazeera.com/xml/rss/all.xml",
            "https://feeds.propublica.org/propublica/main",
          ];

    const fetchPromises = feeds.map(async (feedUrl) => {
      try {
        Logger.debug("RSS", `Fetching feed: ${feedUrl}`);
        const resp = await withRetry(
          () => axios.get(feedUrl, { timeout: 10000 }),
          CONFIG.MAX_RETRIES,
          CONFIG.RETRY_DELAY_MS
        );
        const feed = await parser.parseString(resp.data);

        const articles = feed.items.map((item) => ({
          title: item.title,
          description: item.contentSnippet || item.description || "",
          content: item.content || "",
          url: item.link,
          pubDate: item.pubDate,
          source: { name: feed.title || feedUrl },
        }));

        for (const a of articles) {
          if ((a.content || "").length < 800 && a.url) {
            try {
              const { data: html } = await axios.get(a.url, { timeout: 8000 });
              a.content = sanitizeText(html.replace(/<[^>]+>/g, " ")).slice(
                0,
                5000
              );
            } catch {
              // ignore body-fetch failures
            }
          }
        }

        Logger.info(
          "RSS",
          `Fetched ${articles.length} items from ${feed.title || feedUrl}`
        );
        return articles;
      } catch (err) {
        Logger.warn("RSS", `Failed to fetch ${feedUrl}`, {
          error: err.message,
        });
        return [];
      }
    });

    const results = await Promise.allSettled(fetchPromises);
    results.forEach((r) => r.status === "fulfilled" && all.push(...r.value));
    return all;
  }
}

// Enhanced self-critique function
async function selfCritique(articleHtml) {
  try {
    const wordCount = articleHtml
      .replace(/<[^>]+>/g, " ")
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length;

    const critique = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content: `Rate this op-ed article on a scale of 0-100. Consider:
- Writing quality and engagement (25 points)
- Editorial insight and analysis (25 points)  
- Structure and flow (25 points)
- Professional journalism standards (25 points)

Articles under 400 words should score below 60.
Articles 400-600 words with good analysis should score 70+.
Respond with only a number 0-100.`,
        },
        {
          role: "user",
          content: `Rate this ${wordCount}-word op-ed article:

${sanitizeText(articleHtml, 1500)}

Score (0-100):`,
        },
      ],
      max_tokens: 5,
    });

    stats.apiCalls++;
    const scoreText = critique.choices[0].message.content.trim();
    const score = parseInt(scoreText, 10);

    return isNaN(score) ? 50 : Math.max(0, Math.min(100, score));
  } catch (err) {
    Logger.error("CRITIQUE", "Self-critique failed", { error: err.message });
    return 50;
  }
}

// Robust JSON parsing with multiple fallback strategies
function tryParseJson(raw, title = "Unknown") {
  try {
    const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    const jsonText = codeBlockMatch ? codeBlockMatch[1] : raw;

    let cleaned = jsonText
      .replace(/\\(?!["\\/bfnrtu])/g, "\\\\")
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/<br\s*\/?>/gi, "\\n")
      .trim();

    if (!cleaned.endsWith("}") && cleaned.includes('"rewritten":')) {
      const lastCompleteField = cleaned.lastIndexOf('",');
      if (lastCompleteField > -1) {
        cleaned = cleaned.substring(0, lastCompleteField + 1) + "\n}";
      } else {
        const lastQuote = cleaned.lastIndexOf('"');
        if (lastQuote > -1 && !cleaned.substring(lastQuote).includes("}")) {
          cleaned = cleaned.substring(0, lastQuote + 1) + "\n}";
        }
      }
    }

    const repaired = jsonrepair(cleaned);
    const parsed = JSON.parse(repaired);

    if (!parsed.title && !parsed.rewritten) {
      throw new Error("Missing required fields: title or rewritten");
    }

    if (parsed.rewritten && parsed.rewritten.length < 50) {
      throw new Error("Rewritten content too short");
    }

    return parsed;
  } catch (err) {
    Logger.error("PARSE", `JSON parsing failed for "${title}"`, {
      error: err.message,
      rawPreview: raw.slice(0, 300),
    });

    try {
      let jsonMatch = raw.match(/{[\s\S]*}/);

      if (!jsonMatch) {
        const titleMatch = raw.match(/"title":\s*"([^"]+)"/i);
        const rewrittenMatch = raw.match(/"rewritten":\s*"([\s\S]*?)"/i);
        const summaryMatch = raw.match(/"summary":\s*"([^"]+)"/i);

        if (titleMatch && rewrittenMatch) {
          const reconstructed = {
            title: titleMatch[1],
            rewritten: rewrittenMatch[1]
              .replace(/\\n/g, "\n")
              .replace(/\\"/g, '"'),
            summary: summaryMatch
              ? summaryMatch[1]
              : `Article about ${titleMatch[1]}`,
            tags: ["news", "general"],
            topic: "General News",
            category: "Editorial",
          };

          Logger.warn("PARSE", "Reconstructed JSON from fragments", { title });
          return reconstructed;
        }
      } else {
        const extracted = jsonMatch[0];
        let fixedJson = extracted
          .replace(/,\s*}/g, "}")
          .replace(/,\s*]/g, "]")
          .replace(/([{,]\s*)(\w+):/g, '$1"$2":')
          .replace(/:\s*([^",\[\]{}]+)([,}])/g, ':"$1"$2');

        const repaired = jsonrepair(fixedJson);
        const parsed = JSON.parse(repaired);

        Logger.warn("PARSE", "Recovered using aggressive JSON extraction", {
          title,
        });
        return parsed;
      }

      Logger.warn("PARSE", "Creating fallback structure from raw content", {
        title,
      });

      const titleMatch = raw.match(/title["\s:]+([^"]+)/i);
      const extractedTitle = titleMatch
        ? titleMatch[1].replace(/[",]/g, "").trim()
        : `Article about ${title}`;

      const cleanedContent = raw
        .replace(/[{}"\[\]]/g, "")
        .replace(/title:|rewritten:|summary:|tags:/gi, "")
        .replace(/\s+/g, " ")
        .trim();

      return {
        title: extractedTitle,
        rewritten: `<p>${cleanedContent}</p>`,
        summary: `Article content about ${title}`,
        tags: ["news", "general"],
        topic: "General News",
        category: "Editorial",
      };
    } catch (fallbackErr) {
      Logger.error("PARSE", "All parsing strategies failed", {
        title,
        originalError: err.message,
        fallbackError: fallbackErr.message,
      });
      return null;
    }
  }
}

// Enhanced article rewriting with reporter personality integration
async function rewriteArticle(article, reporter, model = CONFIG.OPENAI_MODEL) {
  const startTime = Date.now();

  if (!article?.title && !article?.description && !article?.content) {
    Logger.warn("REWRITE", "No content in article", { url: article?.url });
    return null;
  }

  const sourceText = `Title: ${article.title || "Untitled"}
Summary: ${sanitizeText(article.summary || article.description || "")}
Content: ${sanitizeText(article.content || "")}
Source: ${article.source?.name || "Unknown Source"}
Published: ${article.pubDate || "Unknown date"}
URL: ${article.url || "N/A"}
${
  article.upvotes
    ? `Reddit Engagement: ${article.upvotes} upvotes, ${article.comments} comments`
    : ""
}`;

  const enhancedSystemPrompt = `You are ${reporter.name}, ${
    reporter.description
  }.

PERSONALITY: ${reporter.persona}

WRITING STYLE: ${reporter.writingStyle}

VOICE: ${reporter.voice}

${reporter.expertise ? `EXPERTISE: ${reporter.expertise.join(", ")}` : ""}

${
  reporter.catchphrases
    ? `SIGNATURE PHRASES: ${reporter.catchphrases.join(", ")}`
    : ""
}

${reporter.backgroundDetails ? `BACKGROUND: ${reporter.backgroundDetails}` : ""}

You MUST:
- Write exactly 400-600 words (critical - under 400 words = automatic rejection)
- Stay completely in character - use YOUR unique voice, style, and perspective
- Use your signature phrases and writing patterns naturally
- Write 5 substantial paragraphs (80-120 words each) with <p> tags
- Include 2 compelling pull-quotes in <blockquote> tags that reflect your voice
- Maintain your political perspective: ${
    reporter.politicalLean || "independent"
  }
- Use HTML formatting properly
- Write engaging, newsworthy content with YOUR unique analysis
- End with your characteristic style (demands, warnings, challenges, etc.)

Return ONLY valid JSON with the specified structure.`;

  const enhancedUserPrompt = `Write a compelling op-ed based on the source material below. This must be a substantial piece of journalism that reflects your unique perspective and expertise.

CRITICAL REQUIREMENTS:
• WORD COUNT: Must be 400-600 words total (count carefully - under 400 words = automatic rejection)
• STRUCTURE: Exactly 5 paragraphs in <p> tags (80-120 words each)
• QUOTES: Include 2 pull-quotes in <blockquote> tags that sound like YOU
• HEADLINE: Write an attention-grabbing, editorial-style headline in YOUR voice
• ANALYSIS: Go beyond reporting - provide YOUR unique insight, context, and editorial perspective
• VOICE: Write completely in character - use your catchphrases, style, and political perspective naturally
• QUALITY: This should read like a professional op-ed from a major publication, but unmistakably in YOUR voice

SOURCE MATERIAL:
${sourceText}

Return as JSON function call with compose_article.`;

  let data = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    const maxTokens = attempt === 1 ? 1200 : 1500;
    Logger.info(
      "REWRITE",
      `Attempt ${attempt}/2 for article: ${article.title?.slice(0, 50)}...`,
      { maxTokens, reporter: reporter.name }
    );

    try {
      const completion = await openai.chat.completions.create({
        model,
        temperature: CONFIG.OPENAI_TEMPERATURE,
        messages: [
          { role: "system", content: enhancedSystemPrompt },
          { role: "user", content: enhancedUserPrompt },
        ],
        functions: [
          {
            name: "compose_article",
            description:
              "Compose a professional op-ed article in the reporter's unique voice",
            parameters: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  description:
                    "Compelling headline in the reporter's voice (8-15 words)",
                },
                rewritten: {
                  type: "string",
                  description:
                    "Full article content with HTML formatting in the reporter's unique style (400-600 words)",
                },
                summary: {
                  type: "string",
                  description:
                    "Article summary reflecting the reporter's perspective (20-40 words)",
                },
                tags: {
                  type: "array",
                  items: { type: "string" },
                  description: "3-5 relevant tags in lowercase",
                },
                topic: {
                  type: "string",
                  description: "Main topic category",
                },
                category: {
                  type: "string",
                  description: "Article category (default: Editorial)",
                },
              },
              required: ["title", "rewritten", "summary", "tags"],
            },
          },
        ],
        function_call: { name: "compose_article" },
        max_tokens: maxTokens,
      });

      stats.apiCalls++;

      const msg = completion.choices[0].message;
      let raw = msg.function_call?.arguments || msg.content || "{}";

      try {
        data = JSON.parse(raw);
      } catch {
        data = tryParseJson(raw, article.title);
      }

      if (!data?.rewritten) {
        Logger.warn("REWRITE", "No usable content returned", { attempt });
        continue;
      }

      const wordCount = data.rewritten
        .replace(/<[^>]+>/g, " ")
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0).length;

      Logger.info("REWRITE", `Article word count: ${wordCount}`, {
        title: data.title?.slice(0, 50),
        attempt,
        reporter: reporter.name,
      });

      if (wordCount < CONFIG.MIN_WORD_COUNT) {
        Logger.warn(
          "REWRITE",
          `Article too short (${wordCount} words). Requesting expansion.`
        );

        const expansionPrompt = `Your previous article was only ${wordCount} words. You MUST expand it to 400-600 words while staying completely in character as ${reporter.name}. 

Expand by:
- Adding more detail and context to each paragraph in YOUR voice
- Including specific examples or data points that fit YOUR perspective
- Expanding YOUR analysis and commentary using YOUR expertise
- Adding relevant background information from YOUR viewpoint
- Ensuring each paragraph is 80-120 words in YOUR distinctive style
- Using more of YOUR signature phrases and writing patterns

Rewrite the entire article to meet the 400-600 word requirement while maintaining YOUR unique voice throughout.`;

        const messages = [
          { role: "system", content: enhancedSystemPrompt },
          { role: "user", content: enhancedUserPrompt },
          { role: "assistant", content: JSON.stringify(data) },
          { role: "user", content: expansionPrompt },
        ];

        try {
          const expansionCompletion = await openai.chat.completions.create({
            model,
            temperature: CONFIG.OPENAI_TEMPERATURE,
            messages,
            functions: [
              {
                name: "compose_article",
                parameters: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    rewritten: { type: "string" },
                    summary: { type: "string" },
                    tags: { type: "array", items: { type: "string" } },
                    topic: { type: "string" },
                    category: { type: "string" },
                  },
                  required: ["title", "rewritten", "summary", "tags"],
                },
              },
            ],
            function_call: { name: "compose_article" },
            max_tokens: 1500,
          });

          stats.apiCalls++;
          const expandedMsg = expansionCompletion.choices[0].message;
          let expandedRaw =
            expandedMsg.function_call?.arguments || expandedMsg.content || "{}";

          try {
            const expandedData = JSON.parse(expandedRaw);
            if (expandedData?.rewritten) {
              const expandedWordCount = expandedData.rewritten
                .replace(/<[^>]+>/g, " ")
                .trim()
                .split(/\s+/)
                .filter((word) => word.length > 0).length;

              if (expandedWordCount >= CONFIG.MIN_WORD_COUNT) {
                data = expandedData;
                Logger.info(
                  "REWRITE",
                  `Successfully expanded to ${expandedWordCount} words`
                );
                break;
              }
            }
          } catch (parseErr) {
            Logger.warn("REWRITE", "Failed to parse expanded content", {
              error: parseErr.message,
            });
          }
        } catch (expansionErr) {
          Logger.error("REWRITE", "Expansion attempt failed", {
            error: expansionErr.message,
          });
        }

        if (attempt === 2) {
          Logger.error(
            "REWRITE",
            "Failed to meet word count requirement after expansion attempts"
          );
          return null;
        }
        continue;
      }

      break;
    } catch (apiErr) {
      Logger.error("REWRITE", `API call failed on attempt ${attempt}`, {
        error: apiErr.message,
      });
      if (attempt === 2) return null;
      continue;
    }
  }

  if (!data?.rewritten) {
    Logger.error("REWRITE", "Failed to generate article after all attempts");
    return null;
  }

  const finalWordCount = data.rewritten
    .replace(/<[^>]+>/g, " ")
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  if (finalWordCount < CONFIG.MIN_WORD_COUNT) {
    Logger.error(
      "REWRITE",
      `Final article still too short: ${finalWordCount} words`
    );
    return null;
  }

  const processingTime = Date.now() - startTime;
  Logger.info("REWRITE", "Article successfully generated", {
    reporter: reporter.name,
    title: data.title,
    wordCount: finalWordCount,
    processingTime: `${processingTime}ms`,
  });

  return data;
}

// Enhanced quality scoring system
function scoreArticleQuality(data) {
  if (!data?.rewritten) return 0;

  let score = 0;
  const content = data.rewritten;
  const wordCount = content
    .replace(/<[^>]+>/g, " ")
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  if (wordCount >= CONFIG.MIN_WORD_COUNT) score += 30;
  if (wordCount >= CONFIG.BONUS_WORD_COUNT) score += 10;
  if (wordCount >= 500) score += 5;

  const paragraphCount = (content.match(/<p>/g) || []).length;
  const blockquoteCount = (content.match(/<blockquote>/g) || []).length;

  if (paragraphCount >= CONFIG.MIN_PARAGRAPHS) score += 20;
  if (paragraphCount >= 5) score += 5;
  if (blockquoteCount >= 2) score += 5;

  const qualityIndicators = [
    content.includes("<em>") || content.includes("<strong>"),
    data.title && data.title.length >= 8 && data.title.length <= 80,
    data.summary && data.summary.split(/\s+/).length >= 15,
    content.includes("?") || content.includes("!"),
    wordCount >= 450,
  ];

  score += qualityIndicators.filter(Boolean).length * 4;

  if (data.tags?.length >= 3) score += 5;
  if (data.tags?.length >= 5) score += 3;
  if (data.topic && data.topic !== "Unknown") score += 2;

  return Math.min(score, 100);
}

// Enhanced reporter stats update
function updateReporterStats(reporter, articleData, qualityScore) {
  const r = stats.reporterStats[reporter.name];

  r.articlesWritten = (r.articlesWritten || 0) + 1;
  r.totalAttempts = (r.totalAttempts || 0) + 1;

  const wordCount = articleData.rewritten
    .replace(/<[^>]+>/g, " ")
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  r.avgWordCount =
    ((r.avgWordCount || 0) * (r.articlesWritten - 1) + wordCount) /
    r.articlesWritten;
  r.avgQualityScore =
    ((r.avgQualityScore || 0) * (r.articlesWritten - 1) + qualityScore) /
    r.articlesWritten;

  const topic = articleData.topic || "Unknown";
  r.topicsCovered = r.topicsCovered || {};
  r.topicsCovered[topic] = (r.topicsCovered[topic] || 0) + 1;

  r.perTopicScore = r.perTopicScore || {};
  if (!r.perTopicScore[topic]) {
    r.perTopicScore[topic] = { totalScore: 0, articles: 0 };
  }
  r.perTopicScore[topic].totalScore += qualityScore;
  r.perTopicScore[topic].articles += 1;

  const errorCount = (r.errors || []).length;
  r.successRate =
    r.totalAttempts > 0 ? (r.articlesWritten / r.totalAttempts) * 100 : 100;

  r.lastUsed = new Date();

  Logger.info("REPORTER_STATS", `Updated stats for ${reporter.name}`, {
    articlesWritten: r.articlesWritten,
    avgWordCount: Math.round(r.avgWordCount),
    avgQualityScore: Math.round(r.avgQualityScore * 10) / 10,
    successRate: Math.round(r.successRate * 10) / 10,
    currentArticleScore: qualityScore,
    currentWordCount: wordCount,
  });
}

// Enhanced stats persistence
async function saveStats() {
  try {
    const statsToSave = {
      ...stats,
      lastSaved: new Date(),
      config: CONFIG,
    };

    await fs.writeFile(STATS_FILE, JSON.stringify(statsToSave, null, 2));
    Logger.info("STATS", "Statistics saved successfully");
  } catch (err) {
    Logger.error("STATS", "Failed to save statistics", { error: err.message });
  }
}

// Load existing stats on startup
async function loadStats() {
  try {
    const data = await fs.readFile(STATS_FILE, "utf8");
    const loadedStats = JSON.parse(data);

    stats = {
      ...stats,
      ...loadedStats,
      lastUpdated: new Date(),
      errors: [],
    };

    Logger.info("STATS", "Statistics loaded successfully");
  } catch (err) {
    Logger.info("STATS", "No existing stats found, starting fresh");
  }
}

// Enhanced article validation
function validateArticleData(data) {
  const errors = [];

  if (!data.title || data.title.length < 10) {
    errors.push("Title is missing or too short");
  }

  if (!data.rewritten || data.rewritten.length < 100) {
    errors.push("Rewritten content is missing or too short");
  }

  const wordCount = data.rewritten
    .replace(/<[^>]+>/g, " ")
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
  if (wordCount < CONFIG.MIN_WORD_COUNT) {
    errors.push(
      `Too few words: ${wordCount} (minimum: ${CONFIG.MIN_WORD_COUNT})`
    );
  }

  if (!data.summary || data.summary.length < 20) {
    errors.push("Summary is missing or too short");
  }

  if (!Array.isArray(data.tags) || data.tags.length === 0) {
    errors.push("Tags are missing or invalid");
  }

  if (!data.topic) {
    errors.push("Topic is missing");
  }

  return errors;
}

// Save rejected articles for analysis
async function saveRejectedArticle(article, rewrittenData, score, reason) {
  try {
    const timestamp = Date.now();
    const filename = `${timestamp}-rejected.json`;
    const rejectedData = {
      timestamp: new Date(),
      reason,
      score,
      original: article,
      rewritten: rewrittenData,
      config: {
        minQualityScore: CONFIG.MIN_QUALITY_SCORE,
        minWordCount: CONFIG.MIN_WORD_COUNT,
      },
    };

    await fs.writeFile(
      path.join(REJECTED_DIR, filename),
      JSON.stringify(rejectedData, null, 2)
    );

    Logger.debug("REJECTED", "Saved rejected article for analysis", {
      filename,
      reason,
      score,
    });
  } catch (err) {
    Logger.error("REJECTED", "Failed to save rejected article", {
      error: err.message,
    });
  }
}

// Main job execution
async function runJob() {
  const jobStartTime = Date.now();
  Logger.info("JOB", "Starting scheduled news fetching and rewriting job");

  try {
    await initializeDirectories();
    await loadStats();
    initReporterStats();

    stats.articlesFetched = 0;
    stats.articlesProcessed = 0;
    stats.articlesRejected = 0;
    stats.lastUpdated = new Date();
    stats.apiCalls = 0;

    let sendArticleNotification;
    try {
      const emailService = require("../utils/emailService");
      sendArticleNotification = emailService.sendArticleNotification;
    } catch (err) {
      Logger.warn("EMAIL", "Email service not available", {
        error: err.message,
      });
    }

    const selectedTopics = getRandomTopicsWithDiversity(CONFIG.TOPICS_PER_RUN);
    Logger.info("JOB", `Processing topics: ${selectedTopics.join(", ")}`);

    for (const topic of selectedTopics) {
      Logger.info("TOPIC", `Processing topic: ${topic}`);

      try {
        const articles = await fetchArticles(topic);
        stats.articlesFetched += articles.length;

        if (articles.length === 0) {
          Logger.warn("TOPIC", `No articles found for topic: ${topic}`);
          continue;
        }

        const articlesToProcess = articles.slice(0, CONFIG.ARTICLES_PER_TOPIC);
        Logger.info(
          "TOPIC",
          `Processing ${articlesToProcess.length} articles for topic: ${topic}`
        );

        for (const article of articlesToProcess) {
          try {
            if (await isDuplicateArticle(article)) {
              Logger.debug("DUPLICATE", "Skipping duplicate article", {
                title: article.title,
                url: article.url,
              });
              continue;
            }

            const reporter = getReporterForTopic(topic);
            const rewrittenData = await rewriteArticle(article, reporter);

            if (!rewrittenData) {
              Logger.warn("REWRITE", "Failed to rewrite article", {
                title: article.title,
              });

              const reporterStats = stats.reporterStats[reporter.name];
              reporterStats.totalAttempts =
                (reporterStats.totalAttempts || 0) + 1;
              reporterStats.errors = reporterStats.errors || [];
              reporterStats.errors.push({
                timestamp: new Date(),
                error: "Failed to rewrite article",
                article: article.title,
              });
              reporterStats.errors = reporterStats.errors.slice(-5);

              continue;
            }

            const validationErrors = validateArticleData(rewrittenData);
            if (validationErrors.length > 0) {
              Logger.warn("VALIDATION", "Article failed validation", {
                title: article.title,
                errors: validationErrors,
              });
              await saveRejectedArticle(
                article,
                rewrittenData,
                0,
                `Validation failed: ${validationErrors.join(", ")}`
              );
              stats.articlesRejected++;
              continue;
            }

            const qualityScore = await selfCritique(rewrittenData.rewritten);

            Logger.info("QUALITY", `Article scored ${qualityScore}/100`, {
              title: rewrittenData.title,
              reporter: reporter.name,
            });

            if (qualityScore < CONFIG.MIN_QUALITY_SCORE) {
              Logger.warn(
                "QUALITY",
                "Article rejected due to low quality score",
                {
                  title: rewrittenData.title,
                  score: qualityScore,
                  threshold: CONFIG.MIN_QUALITY_SCORE,
                }
              );

              await saveRejectedArticle(
                article,
                rewrittenData,
                qualityScore,
                "Low quality score"
              );
              stats.articlesRejected++;
              continue;
            }

            try {
              const articleDoc = await Article.create({
                title: rewrittenData.title,
                original: article.content || article.description || "",
                content: rewrittenData.rewritten,
                summary: rewrittenData.summary,
                tags: rewrittenData.tags || [],
                citations: rewrittenData.citations || [
                  {
                    title: article.source?.name || "Original Source",
                    url: article.url || "",
                  },
                ],
                author: reporter.name,
                voiceId: reporter.voiceId,
                topic: rewrittenData.topic || topic,
                category: rewrittenData.category || "Editorial",
                sourceUrl: article.url,
                photoCredit: article.source?.name || "",
                quotes: rewrittenData.quotes || [],
                status: "draft",
                qualityScore: qualityScore,
                createdAt: new Date(),
              });

              stats.articlesProcessed++;
              updateReporterStats(reporter, rewrittenData, qualityScore);

              if (sendArticleNotification) {
                try {
                  await sendArticleNotification(rewrittenData, reporter);
                } catch (emailErr) {
                  Logger.warn("EMAIL", "Failed to send notification", {
                    error: emailErr.message,
                  });
                }
              }

              Logger.info("SUCCESS", `Article created successfully`, {
                title: rewrittenData.title,
                author: reporter.name,
                qualityScore,
                wordCount: rewrittenData.rewritten
                  .replace(/<[^>]+>/g, " ")
                  .trim()
                  .split(/\s+/)
                  .filter((w) => w.length > 0).length,
                id: articleDoc._id,
              });
            } catch (dbErr) {
              Logger.error("DATABASE", "Failed to save article to database", {
                title: rewrittenData.title,
                error: dbErr.message,
              });
            }
          } catch (articleErr) {
            Logger.error("ARTICLE", "Error processing individual article", {
              title: article.title,
              error: articleErr.message,
            });
          }
        }
      } catch (topicErr) {
        Logger.error("TOPIC", `Error processing topic: ${topic}`, {
          error: topicErr.message,
        });
      }
    }

    const jobDuration = Date.now() - jobStartTime;
    stats.performance.totalRuns++;
    stats.performance.avgProcessingTime =
      (stats.performance.avgProcessingTime * (stats.performance.totalRuns - 1) +
        jobDuration) /
      stats.performance.totalRuns;

    await saveStats();

    Logger.info("JOB", "Job completed successfully", {
      duration: `${jobDuration}ms`,
      articlesFetched: stats.articlesFetched,
      articlesProcessed: stats.articlesProcessed,
      articlesRejected: stats.articlesRejected,
      apiCalls: stats.apiCalls,
      successRate:
        stats.articlesFetched > 0
          ? `${(
              (stats.articlesProcessed / stats.articlesFetched) *
              100
            ).toFixed(1)}%`
          : "0%",
    });

    Logger.info("REPORTERS", "Performance summary for this run:");
    Object.entries(stats.reporterStats)
      .filter(
        ([_, perf]) =>
          perf.lastUsed && new Date() - new Date(perf.lastUsed) < 300000
      )
      .forEach(([name, perf]) => {
        const avgQuality = (perf.avgQualityScore || 0).toFixed(1);
        const avgWordCount = Math.round(perf.avgWordCount || 0);
        const successRate = (perf.successRate || 0).toFixed(1);
        Logger.info(
          "REPORTER_PERF",
          `${name}: ${
            perf.articlesWritten || 0
          } articles, avg quality: ${avgQuality}, avg words: ${avgWordCount}, success rate: ${successRate}%`
        );
      });
  } catch (err) {
    Logger.error("JOB", "Job failed with critical error", {
      error: err.message,
      stack: err.stack,
      duration: `${Date.now() - jobStartTime}ms`,
    });

    stats.errors.push({
      timestamp: new Date(),
      error: err.message,
      context: "job_execution",
    });

    stats.errors = stats.errors.slice(-10);

    try {
      await saveStats();
    } catch (saveErr) {
      Logger.error("STATS", "Failed to save error stats", {
        error: saveErr.message,
      });
    }
  }
}

// Enhanced job scheduling
function scheduleJobs() {
  Logger.info("SCHEDULER", "Initializing job scheduler");

  try {
    initializeDirectories();

    const cronSchedules = CONFIG.CRON_SCHEDULES.map((schedule) =>
      schedule.trim()
    );

    if (cronSchedules.length === 0) {
      throw new Error("No cron schedules configured");
    }

    Logger.info(
      "SCHEDULER",
      `Setting up ${cronSchedules.length} scheduled jobs`,
      { schedules: cronSchedules }
    );

    cronSchedules.forEach((cronTime, index) => {
      try {
        cron.schedule(
          cronTime,
          async () => {
            Logger.info("CRON", `Scheduled job ${index + 1} starting`, {
              schedule: cronTime,
            });

            try {
              await runJob();
              Logger.info(
                "CRON",
                `Scheduled job ${index + 1} completed successfully`
              );
            } catch (err) {
              Logger.error("CRON", `Scheduled job ${index + 1} failed`, {
                error: err.message,
                schedule: cronTime,
              });
            }
          },
          {
            scheduled: true,
            timezone: process.env.TZ || "America/Denver",
          }
        );

        Logger.info("SCHEDULER", `Job ${index + 1} scheduled successfully`, {
          schedule: cronTime,
        });
      } catch (scheduleErr) {
        Logger.error("SCHEDULER", `Failed to schedule job ${index + 1}`, {
          schedule: cronTime,
          error: scheduleErr.message,
        });
      }
    });

    Logger.info(
      "SCHEDULER",
      `All jobs scheduled successfully. Running in timezone: ${
        process.env.TZ || "America/Denver"
      }`
    );

    cron.schedule("0 2 * * *", async () => {
      try {
        Logger.info("CLEANUP", "Running daily cleanup job");

        const rejectedFiles = await fs.readdir(REJECTED_DIR);
        if (rejectedFiles.length > 100) {
          const filesToDelete = rejectedFiles
            .sort()
            .slice(0, rejectedFiles.length - 100);

          for (const file of filesToDelete) {
            await fs.unlink(path.join(REJECTED_DIR, file));
          }

          Logger.info(
            "CLEANUP",
            `Cleaned up ${filesToDelete.length} old rejected articles`
          );
        }

        Object.values(stats.reporterStats).forEach((reporterStat) => {
          reporterStat.errors = reporterStat.errors.slice(-5);
        });

        await saveStats();
        Logger.info("CLEANUP", "Daily cleanup completed");
      } catch (err) {
        Logger.error("CLEANUP", "Daily cleanup failed", { error: err.message });
      }
    });
  } catch (err) {
    Logger.error("SCHEDULER", "Failed to initialize scheduler", {
      error: err.message,
    });
    throw err;
  }
}

// Graceful shutdown handling
process.on("SIGINT", async () => {
  Logger.info("SHUTDOWN", "Received SIGINT, performing graceful shutdown");
  try {
    await saveStats();
    Logger.info("SHUTDOWN", "Stats saved successfully");
  } catch (err) {
    Logger.error("SHUTDOWN", "Failed to save stats during shutdown", {
      error: err.message,
    });
  }
  process.exit(0);
});

process.on("SIGTERM", async () => {
  Logger.info("SHUTDOWN", "Received SIGTERM, performing graceful shutdown");
  try {
    await saveStats();
    Logger.info("SHUTDOWN", "Stats saved successfully");
  } catch (err) {
    Logger.error("SHUTDOWN", "Failed to save stats during shutdown", {
      error: err.message,
    });
  }
  process.exit(0);
});

// Export functions for testing and manual execution
module.exports = {
  scheduleJobs,
  runJob,
  CONFIG,
  stats: () => ({ ...stats }),
  Logger,
  getSubredditsForTopic,
  fetchPostsFromReddit,
  getReporterForTopic,
  fetchArticles,
  rewriteArticle,
  scoreArticleQuality,
  updateReporterStats,
  validateArticleData,
  saveRejectedArticle,
  classifyTopicRelevance,
  selfCritique,
  tryParseJson,
  sanitizeText,
  isDuplicateArticle,
  initReporterStats,
  loadStats,
  saveStats,
  initializeDirectories,
  withRetry,
  getRandomTopicsWithDiversity,
};

// If this file is run directly, start the scheduler
if (require.main === module) {
  Logger.info("STARTUP", "Starting news fetching and rewriting service");
  try {
    scheduleJobs();
    Logger.info("STARTUP", "Service started successfully - jobs scheduled");
  } catch (err) {
    Logger.error("STARTUP", "Failed to start service", { error: err.message });
    process.exit(1);
  }
}
