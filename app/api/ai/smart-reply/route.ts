import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { input_text } = await req.json();
    if (!input_text || typeof input_text !== "string") {
      return NextResponse.json({ error: "Missing or invalid input_text" }, { status: 400 });
    }

    const systemPrompt = `
      You are a smart reply generator. Given a user message, generate 3 short, natural, contextually relevant replies(max 6 words each).
      Only return a JSON array of strings, like ["Hi!", "Hello!", "Hey!"]. Do not include extra text or quotes outside the array.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: input_text },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    let raw = completion.choices[0]?.message?.content?.trim() || "[]";

    // Remove extra surrounding quotes/brackets if model sometimes wraps it
    raw = raw.replace(/^```json/, "").replace(/```$/, "").trim();

    let replies: string[] = [];
    try {
      replies = JSON.parse(raw);
      // Ensure all elements are strings
      replies = replies.filter(r => typeof r === "string");
    } catch {
      // fallback: split lines and clean
      replies = raw
        .split("\n")
        .map(r => r.replace(/^[-*]\s*/, "").trim())
        .filter(Boolean);
    }

    return NextResponse.json({ replies });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
