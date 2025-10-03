import OpenAI from "openai";


export async function createAssistant(openai: OpenAI, fileIds: string[], name = "Default Assistant") {
    const assistant = await openai.beta.assistants.create({
        name,
        model: "gpt-4o", // or whichever you want
        instructions: `You are ${name}, a helpful AI assistant.`,
        tools: [{ type: "code_interpreter" }],
        tool_resources: { code_interpreter: { file_ids: fileIds } },
    });
    return assistant.id;
}


export async function addMessage(openai: OpenAI, threadId: string, content: string) {
    return await openai.beta.threads.messages.create(threadId, {
        role: "user",
        content: [
            {
                type: "text",
                text: content || "Hello Assistant", // fallback
            },
        ],
    });
}



export async function createThread(openai: OpenAI, fileId: string, userMessage: string) {
    const thread = await openai.beta.threads.create({
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: userMessage || "Start with this file",
                    },
                    // File references are not supported in message content; only "text", "image_file", or "image_url" are allowed.
                    // If you want to send a file, you need to use "image_file" or "image_url" with the appropriate structure, or just send text.
                ],
            },
        ],
    });
    return thread.id;
}

export async function getMessages(openai: OpenAI, threadId: string) {
    return await openai.beta.threads.messages.list(threadId);
}

export async function pollRunStatus(openai: OpenAI, threadId: string, runId: string) {
    let status = "";
    let result;
    do {
        result = await openai.beta.threads.runs.retrieve(runId, { thread_id: threadId });
        status = result.status;
        if (status !== "completed") await new Promise((resolve) => setTimeout(resolve, 1000));
    } while (status !== "completed" && status !== "failed");
    return result;
}

export async function uploadFile(file: File, openai: OpenAI) {
    const response = await openai.files.create({
        file,
        purpose: "assistants",
    });
    return response.id; // file_id
}

export async function runThread(openai: OpenAI, threadId: string, assistantId: string) {
    const run = await openai.beta.threads.runs.create(
        threadId,
        {
            assistant_id: assistantId,
        }
    );
    return run.id;
}
