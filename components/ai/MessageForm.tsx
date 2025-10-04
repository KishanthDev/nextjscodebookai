"use client";
import { useState } from "react";

export default function MessageForm() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResponse(null);
    setError(null);
    if (!message.trim()) {
      setError("Please enter a message.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      if (res.ok) {
        setResponse(data.response);
      } else {
        setError(data.error || "Failed to get response.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h2>Test OpenAI Message</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          rows={5}
          style={{ width: "100%", fontSize: 16 }}
          placeholder="Type a message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={loading}
          required
        />
        <br />
        <button type="submit" disabled={loading} style={{ marginTop: 10, padding: "10px 20px" }}>
          {loading ? "Sending..." : "Send"}
        </button>
      </form>

      {response && (
        <div style={{ marginTop: 20 }}>
          <h3>AI Response:</h3>
          <pre style={{ whiteSpace: "pre-wrap" }}>{response}</pre>
        </div>
      )}

      {error && (
        <div style={{ marginTop: 20, color: "red" }}>
          <h3>Error:</h3>
          <pre>{error}</pre>
        </div>
      )}
    </div>
  );
}
