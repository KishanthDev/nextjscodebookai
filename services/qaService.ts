import clientPromise from "@/lib/mongodb";
import { loadJson, saveJson } from "@/lib/jsonDb";
import path from "path";

const BOTS_PATH = path.join(process.cwd(), "data", "bots.json");
const QA_PATH = path.join(process.cwd(), "data", "qa_pairs.json");

export class QaService {
  // Store QA either in JSON or Mongo
  static async saveQA(botId: string, question: string, answer: string, embedding: number[]) {
    // Check if bot exists in JSON
    const bots = loadJson(BOTS_PATH);
    const bot = bots.find((b: any) => b._id === botId);

    if (bot) {
      const qaPairs = loadJson(QA_PATH);

      const existingIndex = qaPairs.findIndex(
        (q: any) => q.botId === botId && q.question === question
      );

      if (existingIndex >= 0) {
        qaPairs[existingIndex] = {
          ...qaPairs[existingIndex],
          answer,
          embedding,
          updatedAt: new Date().toISOString(),
        };
      } else {
        qaPairs.push({
          botId,
          question,
          answer,
          embedding,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      saveJson(QA_PATH, qaPairs);
      return { success: true, storage: "json" };
    }

    // Else → Save in MongoDB
    const client = await clientPromise;
    const db = client.db("mydb");

    await db.collection("qa_pairs").updateOne(
      { botId, question },
      {
        $set: { botId, question, answer, embedding, updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );

    return { success: true, storage: "mongo" };
  }
}
