import { NextResponse } from "next/server";
import { ChatService } from "@/services/chatService";
import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/mongodbHelper";
import { resetFallbackCount, handleFallback } from "@/lib/handleFallback";
import { saveMessage } from "@/lib/conversationHelper";
import { loadJson, saveJson } from "@/lib/jsonDb";
import path from "path";

const CONV_PATH = path.join(process.cwd(), "data", "conversations.json");
const chatService = new ChatService();
const FALLBACK_REGEX = /isn't clear|If you have|Could you please|not trained|rephrase|sorry/i;

export async function POST(req: Request) {
  try {
    const { botId, convId = null, text } = await req.json();
    if (!botId || !text) {
      return NextResponse.json(
        { error: "Bot ID and text are required" },
        { status: 400 }
      );
    }

    // Save user message
    const conversationId = await saveMessage(botId, convId, "user", text);

    // Determine bot type
    const isJsonBot = botId.startsWith("mem_");
    let conversation;

    if (isJsonBot) {
      // JSON bot logic
      const conversations = loadJson(CONV_PATH);
      conversation = conversations.find((c: any) => c._id === conversationId);

      if (!conversation) {
        console.error(`Conversation not found for convId: ${conversationId}`);
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
      }
    } else {
      // MongoDB bot logic
      const collection = await getCollection("conversations");

      // Only cast to ObjectId if valid
      const safeConvId = ObjectId.isValid(conversationId) ? new ObjectId(conversationId) : conversationId;
      const safeBotId = ObjectId.isValid(botId) ? new ObjectId(botId) : botId;

      conversation = await collection.findOne({
        _id: safeConvId,
        botId: safeBotId,
      });

      if (!conversation) {
        console.error(`Conversation not found in MongoDB for convId: ${conversationId}`);
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
      }
    }

    /** 🟢 Human takeover logic */
    if (conversation?.humanTakeover) {
      return NextResponse.json({
        convId: conversationId,
        type: "handover",
        text: "👩‍💻 A human agent has been notified for this conversation.",
      });
    }

    if (/agent|human|support|talk to (a )?person/i.test(text)) {
      if (isJsonBot) {
        const conversations = loadJson(CONV_PATH);
        const idx = conversations.findIndex((c: any) => c._id === conversationId);
        if (idx !== -1) {
          conversations[idx].humanTakeover = true;
          saveJson(CONV_PATH, conversations);
        }
      } else {
        const collection = await getCollection("conversations");
        await collection.updateOne(
          { _id: ObjectId.isValid(conversationId) ? new ObjectId(conversationId) : conversationId },
          { $set: { humanTakeover: true } }
        );
      }

      return NextResponse.json({
        convId: conversationId,
        type: "handover",
        text: "Okay 👩‍💻 transferring you to a human agent...",
      });
    }

    /** 🟢 AI reply pipeline */
    const { qaPairs, articles, sites, pdfs, flows, flowButtons } = await chatService.getBotData(botId);

    const wrapIfString = (r: any) => (typeof r === "string" ? { type: "message", text: r } : r);

    const aiReply =
      wrapIfString(await chatService.handleFlows(text, flows, flowButtons)) ||
      wrapIfString(await chatService.handleQAPairs(text, qaPairs)) ||
      wrapIfString(await chatService.handleArticles(text, articles)) ||
      (await chatService.handleWebsitesAndPDFs(text, sites, pdfs, botId, conversationId));

    /** Case: no reply → fallback */
    if (!aiReply) {
      const fallback = await handleFallback(botId, conversationId);
      await saveMessage(botId, conversationId, "ai", fallback.text);
      return NextResponse.json({ convId: conversationId, ...fallback });
    }

    /** Case: normal text reply */
    if (aiReply && typeof aiReply === "object" && "type" in aiReply && "text" in aiReply) {
      await saveMessage(botId, conversationId, "ai", aiReply.text);

      if (FALLBACK_REGEX.test(aiReply.text)) {
        const fallback = await handleFallback(botId, conversationId);
        return NextResponse.json({ convId: conversationId, ...fallback });
      } else {
        const resetSuccess = await resetFallbackCount(botId, conversationId);
        if (!resetSuccess) {
          console.error(`Failed to reset fallback count for convId: ${conversationId}`);
        }
        return NextResponse.json({ convId: conversationId, ...aiReply });
      }
    }

    /** Case: streaming reply */
    if (aiReply && typeof aiReply === "object" && "textStream" in aiReply) {
      const { textStream } = aiReply;
      let fullText = "";

      return new Response(
        new ReadableStream({
          async start(controller) {
            try {
              controller.enqueue(
                new TextEncoder().encode(
                  `data: ${JSON.stringify({ convId: conversationId, type: "start" })}\n\n`
                )
              );

              for await (const chunk of textStream) {
                const str =
                  typeof chunk === "string"
                    ? chunk
                    : chunk instanceof Uint8Array || ArrayBuffer.isView(chunk)
                      ? new TextDecoder().decode(chunk)
                      : String(chunk);

                fullText += str;

                controller.enqueue(
                  new TextEncoder().encode(
                    `data: ${JSON.stringify({ convId: conversationId, text: str })}\n\n`
                  )
                );
              }

              await saveMessage(botId, conversationId, "ai", fullText);

              if (FALLBACK_REGEX.test(fullText)) {
                await handleFallback(botId, conversationId);
              } else {
                const resetSuccess = await resetFallbackCount(botId, conversationId);
                if (!resetSuccess) {
                  console.error(`Failed to reset fallback count for convId: ${conversationId}`);
                }
              }

              controller.enqueue(
                new TextEncoder().encode(
                  `data: ${JSON.stringify({ convId: conversationId, type: "end" })}\n\n`
                )
              );
              controller.close();
            } catch (err) {
              console.error(`Error in streaming reply for convId: ${conversationId}:`, err);
              controller.error(err);
            }
          },
        }),
        {
          headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        }
      );
    }

    /** Catch-all fallback */
    const fallback = await handleFallback(botId, conversationId);
    await saveMessage(botId, conversationId, "ai", fallback.text);
    return NextResponse.json({ convId: conversationId, ...fallback });
  } catch (err: any) {
    console.error(`Error in chat route for convId: `, err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
