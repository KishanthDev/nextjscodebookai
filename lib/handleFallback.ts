import { getCollection } from "@/lib/mongodbHelper";
import { loadJson, saveJson } from "@/lib/jsonDb";
import { ObjectId } from "mongodb";
import path from "path";

const CONV_PATH = path.join(process.cwd(), "data", "conversations.json");
const MAX_CONSECUTIVE_FALLBACKS = 5;

// Reset fallback count on successful responses

// Reset fallback count on successful responses
export async function resetFallbackCount(botId: string, convId: string): Promise<boolean> {
  const isJsonBot = botId.startsWith("mem_");
  console.log(`Attempting to reset fallback count for botId: ${botId}, convId: ${convId}`);

  try {
    if (isJsonBot) {
      const conversations = loadJson(CONV_PATH);
      const idx = conversations.findIndex((c: any) => c._id === convId);
      if (idx === -1) {
        console.error(`Conversation not found in JSON for convId: ${convId}`);
        return false;
      }

      conversations[idx].fallbackCount = 0;
      saveJson(CONV_PATH, conversations);
      console.log(`Successfully reset fallback count in JSON for convId: ${convId}`);
      return true;
    } else {
      const collection = await getCollection("conversations");
      const result = await collection.updateOne(
        { _id: new ObjectId(convId), botId: new ObjectId(botId) },
        { $set: { fallbackCount: 0 } }
      );
      if (result.modifiedCount > 0) {
        console.log(`Successfully reset fallback count in MongoDB for convId: ${convId}`);
        return true;
      } else {
        console.error(`No conversation modified in MongoDB for convId: ${convId}`);
        return false;
      }
    }
  } catch (err) {
    console.error(`Error resetting fallback count for convId: ${convId}:`, err);
    return false;
  }
}

// Handle fallback responses and increment count
export async function handleFallback(botId: string, convId: string) {
  const isJsonBot = botId.startsWith("mem_");
  console.log(`Handling fallback for botId: ${botId}, convId: ${convId}`);

  try {
    if (isJsonBot) {
      const conversations = loadJson(CONV_PATH);
      const idx = conversations.findIndex((c: any) => c._id === convId);
      if (idx === -1) {
        console.error(`Conversation not found in JSON for convId: ${convId}`);
        return { type: "text", text: "Something went wrong." };
      }

      // Increment fallback count
      conversations[idx].fallbackCount =
        (conversations[idx].fallbackCount || 0) + 1;
      console.log(`Incremented fallback count to ${conversations[idx].fallbackCount} for convId: ${convId}`);

      if (conversations[idx].fallbackCount >= MAX_CONSECUTIVE_FALLBACKS) {
        conversations[idx].humanTakeover = true;
        saveJson(CONV_PATH, conversations);
        console.log(`Triggered human takeover for convId: ${convId} due to ${conversations[idx].fallbackCount} fallbacks`);
        return {
          type: "handover",
          text: "👩‍💻 A human agent has been notified for this conversation.",
        };
      }

      saveJson(CONV_PATH, conversations);
      return { type: "text", text: "🤔 Sorry, I'm not sure. Could you rephrase?" };
    } else {
      const collection = await getCollection("conversations");
      const conv = await collection.findOne({ _id: new ObjectId(convId), botId: new ObjectId(botId) });
      if (!conv) {
        console.error(`Conversation not found in MongoDB for convId: ${convId}`);
        return { type: "text", text: "Something went wrong." };
      }

      // Increment fallback count
      const newCount = (conv.fallbackCount || 0) + 1;
      console.log(`Incremented fallback count to ${newCount} for convId: ${convId}`);

      if (newCount >= MAX_CONSECUTIVE_FALLBACKS) {
        await collection.updateOne(
          { _id: new ObjectId(convId) },
          { $set: { humanTakeover: true, fallbackCount: newCount } }
        );
        console.log(`Triggered human takeover for convId: ${convId} due to ${newCount} fallbacks`);
        return {
          type: "handover",
          text: "👩‍💻 A human agent has been notified for this conversation.",
        };
      }

      await collection.updateOne(
        { _id: new ObjectId(convId) },
        { $set: { fallbackCount: newCount } }
      );
      return { type: "text", text: "🤔 Sorry, I'm not sure. Could you rephrase?" };
    }
  } catch (err) {
    console.error(`Error in handleFallback for convId: ${convId}:`, err);
    return { type: "text", text: "Something went wrong." };
  }
}