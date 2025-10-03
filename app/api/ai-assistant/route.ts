import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  uploadFile,
  createAssistant,
  createThread,
  runThread,
  pollRunStatus,
  getMessages,
  addMessage,
} from "@/components/ai-assistant/assistant";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const USER_TO_AI: Record<string, string> = {
  user1: "Nexa",
  user2: "Luma",
  user3: "AssistIQ",
  user4: "Milo",
};

// Keep track of assistants + threads
const assistants: Record<
  string,
  { id: string; threadId: string; queue: string[]; running: boolean }
> = {};

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const user = data.user as string;
    const message = (data.message as string) || "Hello!";
    const reset = !!data.reset; // optional reset flag

    const aiName = USER_TO_AI[user];
    if (!aiName) return NextResponse.json({ error: "Unknown user" }, { status: 400 });

    // Initialize assistant if needed
    if (!assistants[aiName]) {
      const assistantId = await createAssistant(openai, [], aiName);
      const threadId = await createThread(openai, "", "Conversation started");
      assistants[aiName] = { id: assistantId, threadId, queue: [], running: false };
    }

    const assistant = assistants[aiName];

    // Reset if requested
    /* if (reset) {
      await resetThread(openai, assistant.threadId);
      assistant.queue = [];
      assistant.running = false;
      return NextResponse.json({ success: true, message: "Assistant reset" });
    } */

    // Queue the message
    assistant.queue.push(message);

    // If already running a thread, just wait
    if (assistant.running) return NextResponse.json({ success: true, message: "Queued" });

    // Process the queue
    assistant.running = true;
    const results: any[] = [];

    while (assistant.queue.length > 0) {
      const msg = assistant.queue.shift()!;
      await addMessage(openai, assistant.threadId, msg);
      const runId = await runThread(openai, assistant.threadId, assistant.id);
      await pollRunStatus(openai, assistant.threadId, runId);
      const msgs = await getMessages(openai, assistant.threadId);
      results.push(...msgs.data);
    }

    assistant.running = false;

    const simplified = results.map((m: any) => ({
      id: m.id,
      role: m.role,
      content: Array.isArray(m.content)
        ? m.content.map((c: any) => (c.type === "text" ? c.text.value : "")).join("\n")
        : "",
    }));

    return NextResponse.json({ assistant: aiName, messages: simplified });
  } catch (err: any) {
    console.error("Assistant API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
