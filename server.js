import express from "express";
import cors from "cors";
import fs from "fs/promises"; // Module to read files
import path from "path";

const app = express();
const port = process.env.PORT || 10000; // Render provides the PORT variable
const DATA_DIR = path.join(process.cwd(), "data");

app.use(cors()); // Enable cross-origin requests

// API endpoint to get ALL questions combined
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

// API endpoint to get questions for a SPECIFIC month
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
