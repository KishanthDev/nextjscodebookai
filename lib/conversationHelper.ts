import { loadJson, saveJson } from "@/lib/jsonDb";
import { getCollection } from "@/lib/mongodbHelper";
import { ObjectId } from "mongodb";
import path from "path";

const CONV_PATH = path.join(process.cwd(), "data", "conversations.json");

function isValidObjectId(id: string) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Save a message into a specific conversation
 * @param botId - Bot ID (Mongo or JSON)
 * @param convId - Conversation ID (new one will be created if not exists)
 * @param role - "user" | "ai" | "human"
 * @param text - message content
 */
export async function saveMessage(
  botId: string,
  convId: string | null,
  role: "user" | "ai" | "human",
  text: string
) {
  const isJsonBot = botId.startsWith("mem_"); // 🔹 detect JSON bot
  const now = new Date();

  if (isJsonBot) {
    const conversations = loadJson(CONV_PATH);

    // either find existing conv or create new
    let conv = conversations.find((c: any) => c._id === convId);

    if (!conv) {
      conv = {
         _id: new ObjectId().toHexString(), 
        botId,
        name: "New Conversation",
        messages: [],
        createdAt: now,
        updatedAt: now,
      };
      conversations.push(conv);
    }

    conv.messages.push({ role, text, createdAt: now });
    conv.updatedAt = now;

    saveJson(CONV_PATH, conversations);
    return conv._id;
  } else {
    const collection = await getCollection("conversations");

    // 🔹 Handle convId safely
    let conv = null;
    if (convId && isValidObjectId(convId)) {
      conv = await collection.findOne({ _id: new ObjectId(convId) });
    } else if (convId) {
      conv = await collection.findOne({ _id: new ObjectId(convId) });
    }

    if (!conv) {
      const result = await collection.insertOne({
        botId: isValidObjectId(botId) ? new ObjectId(botId) : botId, // ✅ fix here
        name: "New Conversation",
        messages: [],
        createdAt: now,
        updatedAt: now,
      });
      conv = { _id: result.insertedId };
    }

    await collection.updateOne(
      { _id: conv._id },
      {
        $push: {
          messages: {
            role,
            text,
            createdAt: now,
          },
        },
        $set: { updatedAt: now },
      } as any
    );

    return conv._id;
  }
}
