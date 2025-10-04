// app/api/audio-to-text/route.js
import { transcribeAudio } from "./openai";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("audio");
    const languageEntry = formData.get("language");
    const language = typeof languageEntry === "string" ? languageEntry : undefined;

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Save to a temporary file
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "upload-"));
    const filePath = path.join(tempDir, file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    const transcription = await transcribeAudio(filePath, language);

    await fs.unlink(filePath); // cleanup
    return NextResponse.json({ text: transcription });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
