import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { QaService } from "@/services/qaService";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { botId, question, answer } = await req.json();
    if (!botId || !question || !answer) {
      return NextResponse.json(
        { error: "Bot ID, question, and answer are required." },
        { status: 400 }
      );
    }

    // Get embedding
    const embeddingResult = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: question,
    });
    const embedding = embeddingResult.data[0].embedding as number[];

    // Delegate storage to service
    const result = await QaService.saveQA(botId, question, answer, embedding);

    return NextResponse.json(result);
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
