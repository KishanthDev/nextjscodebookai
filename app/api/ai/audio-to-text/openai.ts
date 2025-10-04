// /lib/openai.ts
import OpenAI from "openai";
import fs from "fs";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Chat Completion (used by sb_open_ai_message, spelling correction, QEA, etc.)
export async function chatCompletion({
  messages,
  model = "gpt-4o-mini",
  temperature = 0.7,
  max_tokens = 512,
}: {
  messages: { role: "user" | "assistant" | "system"; content: string }[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
}) {
  const res = await openai.chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens,
  });
  return res.choices[0]?.message?.content?.trim() || "";
}

// Embeddings
export async function createEmbedding(input: string | string[]) {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input,
  });
  return res.data.map((d) => d.embedding);
}

// Audio transcription (Whisper)
export async function transcribeAudio(filePath: string, language?: string) {
  const res = await openai.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: "whisper-1",
    ...(language ? { language } : {}),
  });
  return res.text;
}
