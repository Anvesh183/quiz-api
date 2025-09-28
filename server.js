import express from "express";
import cors from "cors";
import fs from "fs/promises";
import path from "path";

const app = express();
const port = process.env.PORT || 10000;
const DATA_DIR = path.join(process.cwd(), "data");

// --- Caching ---
let allQuestionsCache = [];
let topicsCache = [];

/**
 * Loads all .json files from the data directory, parses them,
 * and stores them in memory for fast access.
 */
async function loadAndCacheData() {
  try {
    console.log("Loading and caching quiz data...");
    const files = await fs.readdir(DATA_DIR);
    const allQuestions = [];
    for (const file of files) {
      if (path.extname(file) === ".json") {
        const data = await fs.readFile(path.join(DATA_DIR, file), "utf-8");
        allQuestions.push(...JSON.parse(data));
      }
    }
    allQuestionsCache = allQuestions;

    // THIS IS THE NEW DYNAMIC TOPIC LIST GENERATION
    topicsCache = [...new Set(allQuestions.map((q) => q.topic))].sort();

    console.log(
      `Cached ${allQuestionsCache.length} questions and ${topicsCache.length} topics.`
    );
  } catch (error) {
    console.error("Fatal: Failed to load and cache initial data.", error);
    // If we can't load the data, the API is not functional.
    process.exit(1);
  }
}
// --- End Caching ---

app.use(cors());

// Endpoint to get the list of available topics
app.get("/topics", (req, res) => {
  res.json(topicsCache); // Serve the cached list of topics
});

// Endpoint to get ALL questions combined
app.get("/questions", (req, res) => {
  if (allQuestionsCache.length > 0) {
    res.json(allQuestionsCache);
  } else {
    // This case should ideally not be hit if caching is successful
    res
      .status(500)
      .json({ error: "Questions not available. The server cache is empty." });
  }
});

// NEW: Endpoint to get questions for a SPECIFIC topic
app.get("/questions/topic/:topicName", (req, res) => {
  const { topicName } = req.params;
  // Decode URI component to handle topics with special characters like '&'
  const decodedTopicName = decodeURIComponent(topicName);
  const filteredQuestions = allQuestionsCache.filter(
    (q) => q.topic === decodedTopicName
  );

  if (filteredQuestions.length > 0) {
    res.json(filteredQuestions);
  } else {
    res
      .status(404)
      .json({ error: `Questions for topic '${decodedTopicName}' not found.` });
  }
});

// Endpoint to get questions for a SPECIFIC month
app.get("/questions/:monthId", async (req, res) => {
  const { monthId } = req.params;
  const filePath = path.join(DATA_DIR, `${monthId}.json`);
  try {
    const data = await fs.readFile(filePath, "utf-8");
    res.json(JSON.parse(data));
  } catch (error) {
    // This file-read is not cached, assuming month files might be updated/added live.
    // If not, this could also be incorporated into the caching mechanism.
    res
      .status(404)
      .json({ error: `Questions for month '${monthId}' not found.` });
  }
});

// Load data and then start the server
loadAndCacheData().then(() => {
  app.listen(port, () => {
    console.log(`Quiz API listening on port ${port}`);
  });
});
