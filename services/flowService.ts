// lib/services/flowService.ts
import path from "path";
import { ObjectId } from "mongodb";
import {
  loadJson,
  saveJson,
  isJsonBot,
} from "@/lib/jsonDb";
import { getCollection } from "@/lib/mongodbHelper";
import { createEmbedding } from "@/lib/embedding";

const FLOWS_PATH = path.join(process.cwd(), "data", "flows.json");
const BOTS_PATH = path.join(process.cwd(), "data", "bots.json");

// ------- Service Class -------
export class FlowService {
  static async formatFlow(data: any, withEmbedding = true) {
    let embedding: number[] = [];
    if (withEmbedding && data.title) {
      embedding = await createEmbedding(data.title);
    }

    return {
      botId: data.botId,
      flow_id: data.flow_id || `flow_${Date.now()}`,
      title: data.title,
      blocks: data.blocks || [],
      createdAt: data.createdAt || new Date(),
      updatedAt: new Date(),
      embedding,
    };
  }

  // -------- GET --------
  static async getFlows(botId: string) {
    if (isJsonBot(botId, BOTS_PATH)) {
      return loadJson(FLOWS_PATH).filter((f: any) => f.botId === botId);
    }
    return (await getCollection("flows")).find({ botId }).toArray();
  }

  // -------- CREATE --------
  static async createFlow(rawData: any) {
    const flow = await this.formatFlow(rawData, true);

    if (isJsonBot(rawData.botId, BOTS_PATH)) {
      const flows = loadJson(FLOWS_PATH);
      const newFlow = { _id: Date.now().toString(), ...flow };
      flows.push(newFlow);
      saveJson(FLOWS_PATH, flows);
      return newFlow;
    }

    const collection = await getCollection("flows");
    const result = await collection.insertOne(flow);
    return { _id: result.insertedId, ...flow };
  }

  // -------- UPDATE --------
  static async updateFlow(id: string, updateData: any) {
    const data = await this.formatFlow(updateData, true);

    if (isJsonBot(updateData.botId, BOTS_PATH)) {
      const flows = loadJson(FLOWS_PATH);
      const idx = flows.findIndex((f: any) => f._id === id);
      if (idx === -1) return null;
      flows[idx] = { ...flows[idx], ...data, _id: id };
      saveJson(FLOWS_PATH, flows);
      return flows[idx];
    }

    const collection = await getCollection("flows");
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: data },
      { returnDocument: "after" }
    );
    return result?.value || null;
  }

  // -------- DELETE --------
  static async deleteFlow(id: string, botId: string) {
    if (isJsonBot(botId, BOTS_PATH)) {
      const flows = loadJson(FLOWS_PATH);
      const updated = flows.filter((f: any) => f._id !== id);
      saveJson(FLOWS_PATH, updated);
      return updated.length < flows.length;
    }

    const collection = await getCollection("flows");
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }
}
