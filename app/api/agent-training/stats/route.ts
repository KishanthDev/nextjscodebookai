// /api/agent-training/stats/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("mydb");

    const collections = {
      flows: "flows",
      qa_pairs: "qa_pairs",
      files: "pdf_embeddings",
      websites: "websites",
      articles: "articles",
      conversations: "conversations",
    };

    const url = new URL(req.url);
    const botId = url.searchParams.get("botId"); // optional filter

    const stats: Record<string, number> = {};
    const perBot: Record<string, Record<string, number>> = {};

    for (const [key, collectionName] of Object.entries(collections)) {
      const query = botId ? { botId } : {}; // filter by bot if provided
      const docs = await db.collection(collectionName).find(query).toArray();

      let wordCount = 0;

      for (const doc of docs) {
        const texts: string[] = [];

        if (key === "websites" && Array.isArray(doc.chunks)) {
          for (const c of doc.chunks) if (c.chunk) texts.push(c.chunk);
        } else if (key === "flows" && Array.isArray(doc.blocks)) {
          for (const b of doc.blocks) if (b.message) texts.push(b.message);
        } else if (key === "files" && doc.chunk) {
          texts.push(doc.chunk);
        } else if (key === "qa_pairs") {
          if (doc.question) texts.push(doc.question);
          if (doc.answer) texts.push(doc.answer);
        } else {
          if (doc.content) texts.push(doc.content);
          if (doc.text) texts.push(doc.text);
        }

        // Count words
        const words = texts.join(" ").split(/\s+/).filter(Boolean).length;
        wordCount += words;

        // Group by botId
        const bId = doc.botId || "default";
        if (!perBot[bId]) perBot[bId] = {};
        perBot[bId][key] = (perBot[bId][key] || 0) + words;
      }

      stats[key] = (stats[key] || 0) + wordCount;
    }

    return NextResponse.json({ summary: stats, perBot });
  } catch (err) {
    console.error("Training stats error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
