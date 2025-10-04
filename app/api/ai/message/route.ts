import { NextResponse } from "next/server";
import OpenAI from "openai";
import clientPromise from "@/lib/mongodb";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("zotly_sb");
    const qeaCollection = db.collection("qea_embeddings");

    // Create embedding for the incoming question
    const embRes = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: message,
    });
    const queryEmbedding = embRes.data[0].embedding;

    // Find top relevant QEA entries
    interface QeaDoc {
      _id: any;
      embedding: number[];
      question: string;
      answer: string;
      language?: string;
    }

    const qeaDocs = await qeaCollection.find({ embedding: { $exists: true } }).toArray() as QeaDoc[];

    const withScores = qeaDocs.map(doc => ({
      ...doc,
      score: cosineSimilarity(queryEmbedding, doc.embedding),
    }));

    withScores.sort((a, b) => b.score - a.score);

    const topMatches = withScores.slice(0, 3);

    // Build context from top matches
    const contextString = topMatches
      .map(m => `Q: ${m.question}\nA: ${m.answer}`)
      .join("\n\n");

    // Get GPT's response
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an assistant. Use the provided context to answer. If the answer is not in the context, respond appropriately.",
        },
        {
          role: "user",
          content: `Context:\n${contextString}\n\nUser question: ${message}`,
        },
      ],
      temperature: 0.7,
    });

    return NextResponse.json({
      response: completion.choices[0]?.message?.content?.trim() || "",
      matches: topMatches.map(m => ({
        question: m.question,
        answer: m.answer,
        score: m.score,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Cosine similarity helper
function cosineSimilarity(a: number[], b: number[]) {
  let dot = 0.0,
    normA = 0.0,
    normB = 0.0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] ** 2;
    normB += b[i] ** 2;
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
