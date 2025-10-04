// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages)) {
      return NextResponse.json(
        {
          error:
            "Invalid JSON format. Expected: [['user','hello'], ['assistant','hi!']]",
        },
        { status: 400 }
      );
    }

    // Convert [["role", "content"], ...] to correct OpenAI ChatCompletionMessageParam format
    const chatMessages: ChatCompletionMessageParam[] = messages.map(
      ([role, content]: [string, string]) => {
        const normalizedRole = role.toLowerCase();

        if (normalizedRole === "function") {
          return {
            role: "function",
            name: "my_function", // required when role is function
            content: String(content),
          };
        }

        if (normalizedRole === "assistant" || normalizedRole === "system") {
          return {
            role: normalizedRole as "assistant" | "system",
            content: String(content),
          };
        }

        // Default to 'user'
        return {
          role: "user",
          content: String(content),
        };
      }
    );

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: chatMessages,
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || "0.7"),
    });

    let responseText = completion.choices[0]?.message?.content?.trim() || "";

    // Clean formatting
    responseText = responseText
      .replace(/\r|\t/g, "")
      .replace(/(\n){3,}/g, "\n\n");

    return NextResponse.json({
      success: true,
      reply: responseText,
    });
  } catch (error: any) {
    console.error("OpenAI error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
