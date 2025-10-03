import path from "path";
import {
  loadJson,
  isJsonBot
} from "@/lib/jsonDb";
import { getCollection } from "@/lib/mongodbHelper";
import { createEmbedding } from "@/lib/embedding";
import { cosineSimilarity } from "@/lib/similarity";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { handleFallback } from "@/lib/handleFallback";

const TOP_K = 5;

// JSON storage paths
const BOTS_PATH = path.join(process.cwd(), "data", "bots.json");
const QA_PATH = path.join(process.cwd(), "data", "qa_pairs.json");
const ARTICLES_PATH = path.join(process.cwd(), "data", "articles.json");
const FLOWS_PATH = path.join(process.cwd(), "data", "flows.json");
const FLOW_BTNS_PATH = path.join(process.cwd(), "data", "flow_buttons.json");
const WEBSITES_PATH = path.join(process.cwd(), "data", "websites.json");
const PDFS_PATH = path.join(process.cwd(), "data", "pdf_embeddings.json");

export class ChatService {
  async getBotData(botId: string) {
    const jsonBot = isJsonBot(botId, BOTS_PATH);
    if (jsonBot) {
      return {
        qaPairs: loadJson(QA_PATH).filter((q: any) => q.botId === botId),
        articles: loadJson(ARTICLES_PATH).filter((a: any) => a.botId === botId),
        sites: loadJson(WEBSITES_PATH).filter((s: any) => s.botId === botId),
        pdfs: loadJson(PDFS_PATH).filter((p: any) => p.botId === botId),
        flows: loadJson(FLOWS_PATH).filter((f: any) => f.botId === botId),
        flowButtons: loadJson(FLOW_BTNS_PATH).filter((b: any) => b.botId === botId),
      };
    }

    return {
      qaPairs: await (await getCollection("qa_pairs")).find({ botId }).toArray(),
      articles: await (await getCollection("articles")).find({ botId }).toArray(),
      sites: await (await getCollection("websites")).find({ botId }).toArray(),
      pdfs: await (await getCollection("pdf_embeddings")).find({ botId }).toArray(),
      flows: await (await getCollection("flows")).find({ botId }).toArray(),
      flowButtons: await (await getCollection("flow_buttons")).find({ botId }).toArray(),
    };
  }

  async handleFlows(userText: string, flows: any[], flowButtons: any[]) {
    const qEmbedding = await createEmbedding(userText);
    let best: any = null;
    let bestScore = -Infinity;
    let bestType: "flow" | "flow_button" | null = null;

    flows.forEach((f: any) => {
      if (!f.embedding) return;
      const score = cosineSimilarity(f.embedding, qEmbedding);
      if (score > bestScore) {
        best = f;
        bestScore = score;
        bestType = "flow";
      }
    });

    flowButtons.forEach((b: any) => {
      if (!b.embedding) return;
      const score = cosineSimilarity(b.embedding, qEmbedding);
      if (score > bestScore) {
        best = b;
        bestScore = score;
        bestType = "flow_button";
      }
    });

    if (best && bestScore > 0.6) {
      if (bestType === "flow") {
        const startBlock = best.blocks.find((b: any) => b.id === "start");
        let reply: any = {
          type: startBlock?.type ?? "message",
          text: startBlock?.message ?? best.title,
        };
        if (startBlock?.next) {
          const nextBlock = best.blocks.find((b: any) => b.id === startBlock.next);
          if (nextBlock?.type === "send_button_list" && nextBlock.buttons?.length) {
            reply = {
              type: "buttons",
              text: nextBlock.message ?? reply.text,
              buttons: nextBlock.buttons.map((btn: any) => ({
                label: btn.label,
                action: btn.action,
              })),
            };
          } else if (nextBlock?.type === "send_message") {
            reply = { type: "message", text: nextBlock.message };
          }
        }
        return reply;
      }

      if (bestType === "flow_button") {
        const isRedirect = best.action && best.action.startsWith("redirect:");
        return {
          type: "action",
          label: best.label,
          action: best.action,
          message: isRedirect
            ? `Redirecting you to ${best.label} 👉 ${best.action.replace("redirect:", "")}`
            : `Action: ${best.action}`,
        };
      }
    }

    return null;
  }

  async handleQAPairs(userText: string, qaPairs: any[]) {
    if (!qaPairs.length) return null;
    const qEmbedding = await createEmbedding(userText);
    let best: any = null;
    let bestScore = -Infinity;
    qaPairs.forEach((pair: any) => {
      const score = cosineSimilarity(pair.embedding, qEmbedding);
      if (score > bestScore) {
        best = pair;
        bestScore = score;
      }
    });

    if (best && bestScore > 0.6) {
      return best.answer;
    }
    return null;
  }

  async handleArticles(userText: string, articles: any[]) {
    if (!articles.length) return null;
    const qEmbedding = await createEmbedding(userText);
    let best: any = null;
    let bestScore = -Infinity;
    articles.forEach((a: any) => {
      const score = cosineSimilarity(a.embedding, qEmbedding);
      if (score > bestScore) {
        best = a;
        bestScore = score;
      }
    });

    if (best && bestScore > 0.6) {
      return `**${best.title}**\n\n${best.content}`;
    }
    return null;
  }

  async handleWebsitesAndPDFs(
    userText: string,
    sites: any[],
    pdfs: any[],
    botId: string,
    convId: string
  ) {
    const allChunks: { chunk: string; embedding: number[]; source: string }[] = [];
    for (const site of sites) {
      for (const c of site.chunks || []) {
        allChunks.push({
          chunk: c.chunk,
          embedding: c.embedding,
          source: `Website: ${site.url}`,
        });
      }
    }
    for (const pdf of pdfs) {
      allChunks.push({
        chunk: pdf.chunk,
        embedding: pdf.embedding,
        source: `PDF: ${pdf.pdfName}`,
      });
    }

    const qEmbedding = await createEmbedding(userText);
    const scored = allChunks.map((c) => ({
      ...c,
      score: cosineSimilarity(qEmbedding, c.embedding),
    }));

    const topChunks = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, TOP_K)
      .map((c) => `${c.source}:\n${c.chunk}`)
      .join("\n\n");

    if (allChunks.length === 0) {
      return handleFallback(botId, convId);
    }

    const prompt = `
You are an AI assistant.
Use the following combined content from articles, websites, and PDFs if it is relevant to answer the question. 

Relevant training content:
${topChunks || "No relevant context found."}

Rules:
- Only use the above training content.
- Never guess or make assumptions beyond the provided content.
- Format responses in Markdown with clear headings, bullet points, and emojis for readability.
- If the content above does not contain the answer, don't reply 
- Keep the response short, clear, and conversational.

User question: ${userText}
`;

    try {
      return streamText({
        model: openai("gpt-4o-mini"),
        prompt,
      });
    } catch (err) {
      return handleFallback(botId, convId);
    }

  }
}