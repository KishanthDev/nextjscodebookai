import path from "path";
import pdfParse from "pdf-parse";
import {
  loadJson,
  saveJson,
  isJsonBot,
} from "@/lib/jsonDb";
import { getCollection } from "@/lib/mongodbHelper";
import { createEmbedding } from "@/lib/embedding";

const CHUNK_SIZE = 500; // words per chunk
const BOTS_PATH = path.join(process.cwd(), "data", "bots.json");
const PDF_PATH = path.join(process.cwd(), "data", "pdf_embeddings.json");

export class PdfService {
  // -------- Helpers --------
  private static async chunkPdf(buffer: Buffer): Promise<string[]> {
    const pdfData = await pdfParse(buffer);
    const words = pdfData.text.split(/\s+/);
    const chunks: string[] = [];
    for (let i = 0; i < words.length; i += CHUNK_SIZE) {
      chunks.push(words.slice(i, i + CHUNK_SIZE).join(" "));
    }
    return chunks;
  }

  // -------- Upload + Embed --------
  static async uploadPdf(file: File, botId: string) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const chunks = await this.chunkPdf(buffer);
    const pdfName = file.name;

    // ✅ JSON Mode
    if (isJsonBot(botId, BOTS_PATH)) {
      const pdfs = loadJson(PDF_PATH);

      // Prevent duplicate upload
      if (pdfs.some((p: any) => p.botId === botId && p.pdfName === pdfName)) {
        return { success: false, message: "File already uploaded", filename: pdfName };
      }

      for (const chunk of chunks) {
        const embedding = await createEmbedding(chunk);
        pdfs.push({
          _id: Date.now().toString(),
          botId,
          pdfName,
          chunk,
          embedding,
          uploadedAt: new Date(),
        });
      }

      saveJson(PDF_PATH, pdfs);
      return { success: true, filename: pdfName, botId };
    }

    // ✅ MongoDB Mode
    const collection = await getCollection("pdf_embeddings");

    // Prevent duplicate upload
    const existing = await collection.findOne({ botId, pdfName });
    if (existing) {
      return { success: false, message: "File already uploaded", filename: pdfName };
    }

    for (const chunk of chunks) {
      const embedding = await createEmbedding(chunk);
      await collection.insertOne({
        botId,
        pdfName,
        chunk,
        embedding,
        uploadedAt: new Date(),
      });
    }

    return { success: true, filename: pdfName, botId };
  }
}
