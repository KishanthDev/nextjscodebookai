import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { uploadFile, createAssistant, createThread, runThread, pollRunStatus, getMessages } from './assistant';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
    try {
        const data = await req.formData();
        const file = data.get('file') as File | null;
        const userMessage = (data.get('message') as string) || "Hello!";

        // 1. Upload file if provided
        let fileId: string | undefined;
        if (file) {
            fileId = await uploadFile(file, openai);
        }

        // 2. Create Assistant (attach fileIds if available)
        const assistantId = await createAssistant(openai, fileId ? [fileId] : []);

        // 3. Create Thread with initial user message
        const threadId = await createThread(openai, fileId || "", userMessage);

        // 4. Run the Thread/Assistant
        const runId = await runThread(openai, threadId, assistantId);

        // 5. Poll until complete
        await pollRunStatus(openai, threadId, runId);

        // 6. Get results/messages
        const messages = await getMessages(openai, threadId);

        // 7. Normalize for frontend
        const simplified = messages.data.map((m) => ({
            id: m.id,
            role: m.role,
            content: Array.isArray(m.content)
                ? m.content
                    .map((c: any) => (c.type === "text" ? c.text.value : ""))
                    .join("\n")
                : "",
        }));


        return NextResponse.json({ messages: simplified });
    } catch (err: any) {
        console.error('Assistant API error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
