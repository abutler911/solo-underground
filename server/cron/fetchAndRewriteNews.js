const cron = require("node-cron");
const axios = require("axios");
const OpenAI = require("openai");
const topics = require("../utils/topics");
const Article = require("../models/Article");
const reporters = require("../utils/reporters");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function getRandomTopics(count = 2) {
  const shuffled = [...topics].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function fetchArticles(topic) {
  try {
    const res = await axios.get("https://newsapi.org/v2/everything", {
      params: {
        q: topic,
        language: "en",
        sortBy: "relevancy",
        pageSize: 1,
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

function randomQuotePosition() {
  const positions = ["left", "right", "center"];
  return positions[Math.floor(Math.random() * positions.length)];
}

async function rewriteArticle(article, reporter) {
  const prompt = `
You are ${reporter.name}, a journalist known for being ${reporter.description}.

Rewrite the following article in your unique voice, and return a JSON object with:
- "rewritten": the full rewritten article
- "summary": a 30–50 word summary
- "tags": an array of 3–5 relevant keywords
- "quotes": an object with "text" and "attribution"
- "citations": an array of objects with "title" and "url"

Return ONLY the JSON. No commentary or markdown.

Title: ${article.title}
Content: ${article.content || article.description || ""}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a sarcastic, edgy journalist." },
        { role: "user", content: prompt },
      ],
    });

    const content = completion.choices[0].message.content.trim();
    const data = JSON.parse(content);
    return data;
  } catch (err) {
    console.error(
      `[ERROR] OpenAI rewrite failed for "${article.title}":`,
      err.message
    );
    return null;
  }
}

async function runJob() {
  const selectedTopics = getRandomTopics();
  console.log(`[CRON] Fetching topics: ${selectedTopics.join(", ")}`);

  for (let topic of selectedTopics) {
    const articles = await fetchArticles(topic);

    for (let rawArticle of articles) {
      const reporter = reporters[Math.floor(Math.random() * reporters.length)];
      const data = await rewriteArticle(rawArticle, reporter);

      if (!data || !data.rewritten || !data.summary) {
        console.warn(`[SKIP] Incomplete data for "${rawArticle.title}"`);
        continue;
      }

      try {
        await Article.create({
          title: rawArticle.title,
          original: rawArticle.content || rawArticle.description || "",
          content: data.rewritten,
          summary: data.summary,
          tags: data.tags || [],
          quotes: data.quotes
            ? [{ ...data.quotes, position: randomQuotePosition() }]
            : [],
          citations: data.citations || [],
          author: reporter.name,
          voiceId: reporter.voiceId,
          status: "draft",
          topic,
          sourceUrl: rawArticle.url,
          createdAt: new Date(),
        });

        console.log(
          `[CRON] Submitted article by ${reporter.name} on topic "${topic}"`
        );
      } catch (err) {
        console.error(`[ERROR] Saving article failed:`, err.message);
      }
    }
  }
}

function scheduleJobs() {
  cron.schedule("0 8,18 * * *", runJob); // Runs at 8am and 6pm UTC
  console.log("[CRON] Job scheduled to run at 8am and 6pm UTC");
}

module.exports = {
  scheduleJobs,
  runJob,
};
