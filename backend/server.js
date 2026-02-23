import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL_PRIORITY = [
  "gpt-5-mini",
  "gpt-4-mini",
  "gpt-4",
  "gpt-3.5-turbo"
];

async function sendMessageWithFallback(message) {
  for (let model of MODEL_PRIORITY) {
    try {
      const response = await client.responses.create({
        model,
        input: message,
      });

      const reply = response.output?.[0]?.content?.[0]?.text || "Пустой ответ модели";
      return { reply, modelUsed: model };
    } catch (err) {
      if (err.code === "insufficient_quota") {
        console.warn(`[Fallback] Quota exceeded for ${model}, trying next model...`);
        continue; 
      }
      console.error(`[Error] Model ${model} failed:`, err.message);
      throw err;
    }
  }

  throw new Error("Все модели исчерпали квоту или произошла ошибка");
}

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const result = await sendMessageWithFallback(message);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(8000, () => {
  console.log("Server running");
});