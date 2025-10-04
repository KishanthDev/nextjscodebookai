import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Missing or invalid URL" }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    // Fetch HTML
    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json({ error: `HTML retrieval failed with HTTP code: ${res.status}` }, { status: res.status });
    }

    const html = await res.text();

    // Load with cheerio
    const $ = cheerio.load(html);

    // Detect language
    const langAttr = $("html").attr("lang") || "";
    const language = langAttr.trim().toLowerCase();

    // Remove unwanted tags content
    $("style, script").remove();

    // Replace <br> with line breaks in text
    $("br").replaceWith("\n");

    // Build paragraphs
    const paragraphs: [string, string, string][] = [];
    const seen: Set<string> = new Set();

    $("p, h1, h2, h3, h4, h5, h6").each((i, el) => {
      const text = $(el).text().replace(/\s+/g, " ").trim();
      if (text.length > 20 && !seen.has(text)) {
        seen.add(text);
        paragraphs.push([text, language, url]);
      }
    });

    return NextResponse.json({ paragraphs, status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
