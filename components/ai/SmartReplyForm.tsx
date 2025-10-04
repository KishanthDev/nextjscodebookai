"use client";
import { useState } from "react";

export default function SmartReplyForm() {
  const [inputText, setInputText] = useState("");
  const [replies, setReplies] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setReplies([]);
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/smart-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input_text: inputText }),
      });
      const data = await res.json();
      if (res.ok) {
        setReplies(data.replies || []);
      } else {
        setError(data.error || "Unknown error occurred");
      }
    } catch (err: any) {
      setError(err.message || "Unexpected error");
    }

    setLoading(false);
  }

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h2>Test Smart Reply Function</h2>
      <p>-------------OpenAI Chat Completions and asking it to produce 3–5 short replies.------------</p>
      {error && (
        <div style={{ background: "#ffe0e0", color: "#b00020", padding: "1rem", borderRadius: "5px" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
        <label>Enter a message:</label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          style={{ width: "100%", height: "100px", marginTop: "0.5rem" }}
        />
        <button type="submit" disabled={loading} style={{ marginTop: "0.5rem" }}>
          {loading ? "Generating..." : "Generate Smart Replies"}
        </button>
      </form>

      {replies.length > 0 && (
        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            background: "#f0f0f0",
            borderRadius: "5px",
          }}
        >
          <h3>Smart Replies:</h3>
          <ul>
            {replies.map((reply, i) => (
              <li key={i}>{reply}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
