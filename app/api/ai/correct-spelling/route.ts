import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input_text = body.input_text;
    if (!input_text) {
      return new Response(JSON.stringify({ error: "Missing input_text" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

   const systemPrompt = `
Fix spelling mistakes of the following text.
Return only the corrected text (no explanations, no quotes).
`;
 const openaiBody = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `${input_text}` },
      ],
      max_tokens: 1000,
      temperature: 0,
    };

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return new Response(JSON.stringify({ error: "OPENAI_API_KEY not set" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(openaiBody),
    });

    const json = await response.json();
    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: json.error?.message || "OpenAI API Error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        result: json.choices?.[0]?.message?.content?.trim() || "",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
