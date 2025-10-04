"use client";
import { useState } from "react";

export default function UserExpressionsForm() {
  const [message, setMessage] = useState("");
  const [expressions, setExpressions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setExpressions([]);
    if (!message.trim()) {
      setError("Please enter a sentence.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/user-expressions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      if (res.ok) {
        setExpressions(data.expressions || []);
      } else {
        setError(data.error || "Unknown error");
      }
    } catch (err: any) {
      setError(err.message || "Unexpected error");
    }
    setLoading(false);
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h3>Test: Sentence Variants via OpenAI</h3>
      <p>----------------------OpenAI to create at least 10 variations of that sentence--------------------------</p>
      <form onSubmit={handleSubmit}>
        <label>Enter Sentence:</label>
        <br />
        <textarea
          rows={4}
          cols={60}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          disabled={loading}
        />
        <br />
        <button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate Variants"}
        </button>
      </form>

      {error && (
        <div style={{ color: "red", marginTop: "1rem" }}>
          <h4>Error:</h4>
          <pre>{error}</pre>
        </div>
      )}

      {expressions.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <h4>Generated Expressions:</h4>
          <ol>
            {expressions.map((expr, idx) => (
              <li key={idx}>{expr}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
