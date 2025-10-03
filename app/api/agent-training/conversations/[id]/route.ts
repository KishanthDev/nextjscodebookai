import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodbHelper";
import { ObjectId } from "mongodb";
import { loadJson, saveJson } from "@/lib/jsonDb";
import path from "path";

const CONV_PATH = path.join(process.cwd(), "data", "conversations.json");

// PATCH /api/agent-training/conversations/:id
export async function PATCH(req: Request, context: any) {
  try {
    const { id: convId } = await context.params; // ✅ await params
    const { name, botId } = await req.json(); // ✅ get botId from body

    if (!botId) return NextResponse.json({ error: "botId required" }, { status: 400 });
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

    const isJsonBot = botId.startsWith("mem_");

    if (isJsonBot) {
      const conversations = loadJson(CONV_PATH);
      const idx = conversations.findIndex((c: any) => c._id === convId && c.botId === botId);
      if (idx !== -1) {
        conversations[idx].name = name;
        conversations[idx].updatedAt = new Date();
        saveJson(CONV_PATH, conversations);
      }
      return NextResponse.json({ success: true });
    } else {
      const collection = await getCollection("conversations");
      await collection.updateOne(
        { _id: new ObjectId(convId), botId: new ObjectId(botId) },
        { $set: { name, updatedAt: new Date() } }
      );
      return NextResponse.json({ success: true });
    }
  } catch (err: any) {
    console.error("Rename conversation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET /api/agent-training/conversations/:id
export async function GET(req: Request, context: any) {
  try {
    const { id: convId } = await context.params; // ✅ await params
    const { searchParams } = new URL(req.url);
    const botId = searchParams.get("botId");
    if (!botId) return NextResponse.json({ error: "botId required" }, { status: 400 });

    const isJsonBot = botId.startsWith("mem_");

    if (isJsonBot) {
      const conversations = loadJson(CONV_PATH);
      const conv = conversations.find((c: any) => c._id === convId && c.botId === botId);
      if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(conv);
    } else {
      const collection = await getCollection("conversations");
      const conv = await collection.findOne({
        _id: new ObjectId(convId),
        botId: new ObjectId(botId),
      });
      if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(conv);
    }
  } catch (err: any) {
    console.error("Get conversation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/agent-training/conversations/:id
export async function DELETE(req: Request, context: any) {
  try {
    const { id: convId } = await context.params; // ✅ await params
    const { botId } = await req.json(); // ✅ botId from body

    if (!botId) return NextResponse.json({ error: "botId required" }, { status: 400 });

    const isJsonBot = botId.startsWith("mem_");

    if (isJsonBot) {
      let conversations = loadJson(CONV_PATH);
      conversations = conversations.filter((c: any) => !(c._id === convId && c.botId === botId));
      saveJson(CONV_PATH, conversations);
      return NextResponse.json({ success: true });
    } else {
      const collection = await getCollection("conversations");
      await collection.deleteOne({ _id: new ObjectId(convId), botId: new ObjectId(botId) });
      return NextResponse.json({ success: true });
    }
  } catch (err: any) {
    console.error("Delete conversation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
