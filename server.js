import express from "express";
import cors from "cors";
import fs from "fs/promises";
import path from "path";

const app = express();
const port = process.env.PORT || 10000;
const DATA_DIR = path.join(process.cwd(), "data");

// Define your available topics here
const availableTopics = [
  "Regulatory bodies",
  "Government schemes",
  "1st of its kind",
  "Cabinet Approvals",
  "National",
  "Insurance",
  "Banking",
  "Economy",
  "Finance",
  "Ministries",
  "India's International",
  "International",
  "International Organisations",
  "Reports and Indices",
  "Gatherings",
  "Awards",
  "MoUs",
  "State",
  "Sports",
  "Person in News",
  "Misc",
  "Defence",
  "S&T",
  "Apps and Portals",
];

app.use(cors());

// ==========================================================
// THIS IS THE MISSING ENDPOINT
// ==========================================================
app.get("/topics", (req, res) => {
  res.json(availableTopics);
});
// ==========================================================

// Endpoint to get ALL questions combined
app.get("/questions", async (req, res) => {
  try {
    const files = await fs.readdir(DATA_DIR);
    const allQuestions = [];
    for (const file of files) {
      if (path.extname(file) === ".json") {
        const data = await fs.readFile(path.join(DATA_DIR, file), "utf-8");
        allQuestions.push(...JSON.parse(data));
      }
    }
    res.json(allQuestions);
  } catch (error) {
    res.status(500).json({ error: "Failed to load questions." });
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
    res
      .status(404)
      .json({ error: `Questions for month '${monthId}' not found.` });
  }
});

app.listen(port, () => {
  console.log(`Quiz API listening on port ${port}`);
});
