
import path from "path";
import { ObjectId } from "mongodb";
import {
  loadJson,
  saveJson,
  isJsonBot
} from "@/lib/jsonDb";
import { getCollection } from "@/lib/mongodbHelper";
import { createEmbedding } from "@/lib/embedding";

const ARTICLES_PATH = path.join(process.cwd(), "data", "articles.json");
const BOTS_PATH = path.join(process.cwd(), "data", "bots.json");

export class ArticleService {
  // ---------- Helpers ----------
  private loadJson = loadJson;
  private saveJson = saveJson;
  private isJsonBot(botId: string) {
    return isJsonBot(botId, BOTS_PATH);
  }

  private async formatArticle(data: any, withEmbedding = true) {
    let embedding: number[] = [];
    if (withEmbedding && data.content) {
      embedding = await createEmbedding(data.content);
    }
    return {
      botId: data.botId,
      title: data.title || "",
      content: data.content || "",
      link: data.link || "",
      parent_category: data.parent_category || "General",
      categories: Array.isArray(data.categories) ? data.categories : [],
      createdAt: data.createdAt || new Date(),
      updatedAt: new Date(),
      embedding,
    };
  }

  // ---------- CRUD ----------
  async getArticles(botId?: string, id?: string) {
    if (botId && this.isJsonBot(botId)) {
      const all = this.loadJson(ARTICLES_PATH);
      if (id) return all.find((a: any) => a._id === id) || null;
      return all.filter((a: any) => a.botId === botId);
    }
    const collection = await getCollection("articles");
    if (id) return await collection.findOne({ _id: new ObjectId(id) });
    const filter: any = {};
    if (botId) filter.botId = botId;
    return collection.find(filter).sort({ createdAt: -1 }).toArray();
  }

  async createArticle(rawData: any) {
    const data = await this.formatArticle(rawData, true);
    if (this.isJsonBot(rawData.botId)) {
      const articles = this.loadJson(ARTICLES_PATH);
      const newArticle = { _id: Date.now().toString(), ...data };
      articles.push(newArticle);
      this.saveJson(ARTICLES_PATH, articles);
      return newArticle;
    }
    const collection = await getCollection("articles");
    const result = await collection.insertOne(data);
    return { _id: result.insertedId, ...data };
  }

  async updateArticle(id: string, updateData: any) {
    const data = await this.formatArticle(updateData, true);
    if (this.isJsonBot(updateData.botId)) {
      const articles = this.loadJson(ARTICLES_PATH);
      const idx = articles.findIndex((a: any) => a._id === id);
      if (idx === -1) return null;
      articles[idx] = { ...articles[idx], ...data, _id: id };
      this.saveJson(ARTICLES_PATH, articles);
      return articles[idx];
    }
    const collection = await getCollection("articles");
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: data },
      { returnDocument: "after" }
    );
    return result?.value || null;
  }

  async deleteArticle(id: string, botId: string) {
    if (this.isJsonBot(botId)) {
      const articles = this.loadJson(ARTICLES_PATH);
      const updated = articles.filter((a: any) => a._id !== id);
      this.saveJson(ARTICLES_PATH, updated);
      return updated.length < articles.length;
    }
    const collection = await getCollection("articles");
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }
}
