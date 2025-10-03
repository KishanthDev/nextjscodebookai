// app/api/websites/route.ts
import { NextResponse } from "next/server";
import { WebsiteService } from "@/services/websiteService";

// GET
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const botId = searchParams.get("botId");
  if (!botId) {
    return NextResponse.json({ error: "Missing botId" }, { status: 400 });
  }

  const sites = await WebsiteService.getSites(botId);
  return NextResponse.json(sites);
}

// POST
export async function POST(req: Request) {
  const { botId, url } = await req.json();
  if (!botId || !url) {
    return NextResponse.json({ error: "Missing botId or url" }, { status: 400 });
  }

  const site = await WebsiteService.trainSite(botId, url);
  return NextResponse.json(site);
}
