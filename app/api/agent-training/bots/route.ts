// app/api/bots/route.ts
import { NextResponse } from "next/server";
import { BotService } from "@/services/BotService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newBot = await BotService.createBot(body);
    return NextResponse.json(newBot, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const bots = await BotService.getBots();
    return NextResponse.json(bots);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
