const cron = require("node-cron");
const axios = require("axios");
const OpenAI = require("openai");
const { jsonrepair } = require("jsonrepair");
const topics = require("../utils/topics");
const Article = require("../models/Article");
const reporters = require("../utils/reporters");

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
    return null;
  }
}

async function fetchArticles(topic) {
  try {
    const res = await axios.get("https://newsapi.org/v2/everything", {
      params: {
        q: topic,
        language: "en",
        sortBy: "relevancy",
        pageSize: 1, // ⬅️ now only fetch 1 article per topic
        apiKey: process.env.NEWS_API_KEY,
      },
    });
    return res.data.articles || [];
  } catch (err) {
    console.error(
      `[ERROR] Fetching articles for topic "${topic}":`,
      err.message
    );
    return [];
  }
}

async function rewriteArticle(article, reporter) {
  const topicList = topics.map((t) => `"${t}"`).join(", ");

  const prompt = `
You are ${reporter.name}, a journalist known for being ${reporter.description}.

Rewrite the article below in your own voice and tone. Choose the most relevant topic from this list: [${topicList}].

Return only a JSON object with:
- rewritten (the full article — no need to restate the title)
- summary (30–50 words)
- tags (array of 3–5 keywords)
- citations (array of { title, url })
- topic (chosen from list)

Do NOT include markdown code blocks or commentary.

Source Title: ${article.title}
Source Content: ${article.content || article.description || ""}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a sarcastic, edgy journalist." },
        { role: "user", content: prompt },
      ],
    });

    const raw = completion.choices[0].message.content.trim();
    return tryParseJson(raw, article.title);
  } catch (err) {
    console.error(
      `[ERROR] Rewrite failed for "${article.title}":`,
      err.message
    );
    return null;
  }
}

async function runJob() {
  const selectedTopics = getRandomTopics();
  console.log(`[CRON] Fetching topics: ${selectedTopics.join(", ")}`);

  for (const topic of selectedTopics) {
    const articles = await fetchArticles(topic);
    console.log(
      `[CRON] Found ${articles.length} articles for topic "${topic}"`
    );

    for (const rawArticle of articles) {
      const reporter = reporters[Math.floor(Math.random() * reporters.length)];
      const data = await rewriteArticle(rawArticle, reporter);

      if (
        !data ||
        !data.rewritten ||
        !data.summary ||
        !data.tags ||
        !data.topic
      ) {
        console.warn(
          `[SKIP] Missing required fields for "${rawArticle.title}"`
        );
        continue;
      }

      try {
        await Article.create({
          title: rawArticle.title, // pre-fills title input
          original: rawArticle.content || rawArticle.description || "",
          content: data.rewritten,
          summary: data.summary,
          tags: data.tags,
          citations: data.citations || [],
          author: reporter.name, // pre-fills author field
          voiceId: reporter.voiceId,
          topic: data.topic,
          sourceUrl: rawArticle.url,
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

module.exports = {
  scheduleJobs,
  runJob,
};
