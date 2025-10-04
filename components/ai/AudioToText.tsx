"use client";
import { useState } from "react";

export default function AudioToTextForm() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/ai/audio-to-text", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResult(data.text || data.error || "");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <input type="file" name="audio" accept="audio/*" required />
      <input type="text" name="language" placeholder="Language (optional)" />
      <button type="submit" disabled={loading}>
        {loading ? "Transcribing..." : "Transcribe"}
      </button>
      {result && <pre>{result}</pre>}
    </form>
  );
}
