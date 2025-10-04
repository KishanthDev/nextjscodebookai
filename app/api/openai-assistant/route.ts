import { NextResponse } from "next/server";

const OPENAI_API = "https://api.openai.com/v1/assistants";
const headers = {
  Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  "Content-Type": "application/json",
  "OpenAI-Beta": "assistants=v2",
};

// ✅ GET: List all assistants
export async function GET() {
  try {
    const res = await fetch(OPENAI_API, { headers });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to list assistants" }, { status: 500 });
  }
}

// ✅ POST: Create a new assistant
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await fetch(OPENAI_API, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create assistant" }, { status: 500 });
  }
}
