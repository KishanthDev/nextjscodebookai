// lib/services/BotService.ts
import path from "path";
import {
  loadJson,
  saveJson,
} from "@/lib/jsonDb"; 
import { getCollection } from "@/lib/mongodbHelper";

const COLLECTION = "bots";
const memoryFile = path.join(process.cwd(), "data/bots.json");

export class BotService {
  // 🔹 Load bots from JSON file
  private static loadMemoryBots() {
    return loadJson(memoryFile);
  }
  
  // 🔹 Save bots to JSON file
  private static saveMemoryBots(bots: any[]) {
    saveJson(memoryFile, bots);
  }

  // 🔹 Create bot
  static async createBot(body: any) {
    if (!body.name) throw new Error("Bot name required");

    if (!body.useMongo) {
      const bots = this.loadMemoryBots();
      const newBot = { _id: `mem_${Date.now()}`, ...body };
      bots.push(newBot);
      this.saveMemoryBots(bots);
      return newBot;
    }

    const collection = await getCollection(COLLECTION);
    const result = await collection.insertOne(body);
    return { _id: result.insertedId, ...body };
  }

  // 🔹 Get all bots
  static async getBots() {
    const memoryBots = this.loadMemoryBots();
    const collection = await getCollection(COLLECTION);
    const mongoBots = await collection.find({}).toArray();
    return [...memoryBots, ...mongoBots];
  }
}
