// lib/services/websiteService.ts
import * as cheerio from "cheerio";
import { loadJson, saveJson, isJsonBot } from "@/lib/jsonDb";
import { getCollection } from "@/lib/mongodbHelper";
import { normalizeUrl } from "@/lib/urlUtils";
import path from "path";
import { chunkText } from "@/lib/chunkText";
import { createEmbedding } from "@/lib/embedding";

const WEBSITES_PATH = path.join(process.cwd(), "data", "websites.json");
const BOTS_PATH = path.join(process.cwd(), "data", "bots.json");

export class WebsiteService {
  /**
   * Get all websites for a given bot (JSON or Mongo)
   */
  static async getSites(botId: string) {
    if (isJsonBot(botId, BOTS_PATH)) {
      const websites = loadJson(WEBSITES_PATH).filter((w: any) => w.botId === botId);
      return websites.map((u: any) => ({
        url: u.url,
        slug: u.slug,
        createdAt: u.uploadedAt,
      }));
    }

    const collection = await getCollection("websites");
    const urls = await collection
      .find({ botId }, { projection: { url: 1, slug: 1, uploadedAt: 1 } })
      .toArray();

    return urls.map((u: any) => ({
      url: u.url,
      slug: u.slug,
      createdAt: u.uploadedAt?.toISOString(),
    }));
  }

  /**
   * Scrape, chunk, embed, and save a website
   */
  static async trainSite(botId: string, url: string) {
    // 1. Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      throw new Error("Invalid URL format");
    }

    // 2. Fetch HTML
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch HTML (${res.status})`);

    const html = await res.text();
    const $ = cheerio.load(html);

    // Remove unwanted tags
    $("style, script").remove();
    $("br").replaceWith("\n");

    // Detect language
    const langAttr = $("html").attr("lang") || "";
    const language = langAttr.trim().toLowerCase() || "en";

    // Extract text
    const paragraphs: string[] = [];
    const seen = new Set<string>();
    $("p, h1, h2, h3, h4, h5, h6").each((_, el) => {
      const text = $(el).text().replace(/\s+/g, " ").trim();
      if (text.length > 20 && !seen.has(text)) {
        seen.add(text);
        paragraphs.push(text);
      }
    });

    if (paragraphs.length === 0) {
      const bodyText = $("body").text().replace(/\s+/g, " ").trim();
      if (bodyText.length > 20) paragraphs.push(bodyText);
    }

    // 3. Chunk & embed
    const chunkDocs: { chunk: string; embedding: number[] }[] = [];
    for (const para of paragraphs) {
      const chunks = chunkText(para, 200);
      for (const chunk of chunks) {
        const embedding = await createEmbedding(chunk);
        chunkDocs.push({ chunk, embedding });
      }
    }

    const siteDoc = {
      url,
      slug: normalizeUrl(url),
      botId,
      language,
      chunks: chunkDocs,
      uploadedAt: new Date().toISOString(),
    };

    // 4. Save
    if (isJsonBot(botId, BOTS_PATH)) {
      let websites = loadJson(WEBSITES_PATH);
      websites.push(siteDoc);

      // enforce max 10 per bot
      const botSites = websites.filter((w: any) => w.botId === botId);
      if (botSites.length > 10) {
        const toRemove = botSites
          .sort(
            (a: any, b: any) =>
              new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
          )
          .slice(0, botSites.length - 10);
        websites = websites.filter((w: any) => !toRemove.includes(w));
      }

      saveJson(WEBSITES_PATH, websites);
    } else {
      const collection = await getCollection("websites");
      await collection.insertOne(siteDoc);

      const count = await collection.countDocuments({ botId });
      if (count > 10) {
        const oldest = await collection
          .find({ botId })
          .sort({ uploadedAt: 1 })
          .limit(count - 10)
          .toArray();
        const idsToRemove = oldest.map((doc) => doc._id);
        if (idsToRemove.length > 0) {
          await collection.deleteMany({ _id: { $in: idsToRemove } });
        }
      }
    }

    return {
      url,
      slug: siteDoc.slug,
      chunks: chunkDocs.length,
    };
  }
}
