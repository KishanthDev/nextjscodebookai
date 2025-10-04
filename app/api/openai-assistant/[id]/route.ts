import { NextResponse } from "next/server";

const BASE_URL = "https://api.openai.com/v1/assistants";
const headers = {
  Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  "Content-Type": "application/json",
  "OpenAI-Beta": "assistants=v2",
};

// ✅ GET: Retrieve assistant by ID
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // Updated type
) {
  try {
    const { id } = await params; // Await the params
    const res = await fetch(`${BASE_URL}/${id}`, { headers });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch assistant" }, { status: 500 });
  }
}

// ✅ POST: Update assistant
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // Updated type
) {
  try {
    const { id } = await params; // Await the params
    const body = await req.json();
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update assistant" }, { status: 500 });
  }
}

// ✅ DELETE: Delete assistant
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // Updated type
) {
  try {
    const { id } = await params; // Await the params
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
      headers,
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete assistant" }, { status: 500 });
  }
}
