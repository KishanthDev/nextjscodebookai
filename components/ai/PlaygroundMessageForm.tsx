"use client";
import { useState } from "react";

export default function PlaygroundMessageForm() {
  const [messagesJson, setMessagesJson] = useState(
    '[["user", "What is the capital of France?"], ["assistant", "The capital of France is Paris."], ["user", "Tell me a fun fact about it."]]'
  );
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      let parsed;
      try {
        parsed = JSON.parse(messagesJson);
      } catch {
        setError("Invalid JSON format");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/ai/playground-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: parsed }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error");
      } else {
        setResult(data.reply);
      }
    } catch (err: any) {
      setError(err.message || "Unexpected error");
    }

    setLoading(false);
  }

  return (
    <div style={{ fontFamily: "sans-serif", padding: "1rem" }}>
      <h2>OpenAI Playground Message Tester</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="messages">Enter Messages (JSON format):</label>
        <textarea
          id="messages"
          rows={10}
          style={{ width: "100%", margin: "0.5rem 0" }}
          value={messagesJson}
          onChange={(e) => setMessagesJson(e.target.value)}
        />
        <button disabled={loading}>
          {loading ? "Sending..." : "Send to Playground"}
        </button>
      </form>

      {error && (
        <div style={{ color: "red", marginTop: "1rem" }}>
          <h3>Error</h3>
          <pre>{error}</pre>
        </div>
      )}

      {result && (
        <div style={{ marginTop: "1rem" }}>
          <h3>Response</h3>
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
}
