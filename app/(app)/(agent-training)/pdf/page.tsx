"use client";
import BotSelector from "@/components/agent-training/SelectBots";
import { useState } from "react";

export default function PdfUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [filename, setFilename] = useState<string>("");
  const [botId, setBotId] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState<string>("");

  // Upload PDF
  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("botId", botId);

    try {
      const res = await fetch("/api/agent-training/pdf", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setFilename(file.name);
        setUploaded(true);
      } else {
        setError(data.message || "Upload failed");
      }
    } catch (err) {
      setError("Upload failed");
      console.error(err);
    }

    setUploading(false);
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="border p-4 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-3">Upload PDF</h2>
        <BotSelector onSelect={(id) => setBotId(id)} />
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="ml-3 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>

        {uploaded && (
          <p className="text-green-600 mt-2">✅ {filename} uploaded</p>
        )}
        {error && <p className="text-red-600 mt-2">⚠️ {error}</p>}
      </div>
    </div>
  );
}
