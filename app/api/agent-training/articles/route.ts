import { NextRequest, NextResponse } from "next/server";
import { ArticleService } from "@/services/ArticleService";

const articleService = new ArticleService();

// ---------- GET ----------
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id") || undefined;
  const botId = req.nextUrl.searchParams.get("botId") || undefined;

  if (!botId && !id) {
    return NextResponse.json({ error: "botId or id required" }, { status: 400 });
  }

  const result = await articleService.getArticles(botId, id);
  return NextResponse.json(result || {});
}

// ---------- POST ----------
export async function POST(req: NextRequest) {
  const rawData = await req.json();
  if (!rawData.botId) {
    return NextResponse.json({ error: "Missing botId" }, { status: 400 });
  }

  const result = await articleService.createArticle(rawData);
  return NextResponse.json(result);
}

// ---------- PUT ----------
export async function PUT(req: NextRequest) {
  const { id, ...updateData } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "Missing article ID" }, { status: 400 });
  }

  const result = await articleService.updateArticle(id, updateData);
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(result);
}

// ---------- DELETE ----------
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const botId = req.nextUrl.searchParams.get("botId");

  if (!id || !botId) {
    return NextResponse.json({ error: "Missing article ID or botId" }, { status: 400 });
  }

  const success = await articleService.deleteArticle(id, botId);
  return NextResponse.json({ success });
}
