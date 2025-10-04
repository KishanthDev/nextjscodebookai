import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Init OpenAI client using environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { input_text } = await req.json();

    if (!input_text || typeof input_text !== "string") {
      return NextResponse.json({ error: "Missing or invalid 'input_text'" }, { status: 400 });
    }

    // This is equivalent to sb_open_ai_message($text, 'fix-grammar')
    const systemPrompt = "You are a helpful assistant that corrects grammar, spelling, and minor style issues without changing meaning. Return only the corrected text.";

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini", // set default
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: input_text },
      ],
      temperature: 0,
    });

    let result = completion.choices[0]?.message?.content || "";

    // Ensure string, trim, normalize newlines (like PHP implode logic)
    result = result.replace(/\r/g, "").trim();

    return NextResponse.json({ result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
