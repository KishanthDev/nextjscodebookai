"use client";
import { useState } from "react";

export default function TextFormatterForm() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOutput("");

    try {
      const res = await fetch("/api/ai/text-format", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input_text: input }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "An error occurred");
      } else {
        setOutput(data.result || "");
      }
    } catch (err: any) {
      setError(err.message);
    }

    setLoading(false);
  }

  return (
    <div style={{ fontFamily: "Arial", padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <h2>AI Text Formatter</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="input_text">Enter text to format/fix:</label>
        <br />
        <textarea
          id="input_text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste or type your text here..."
          rows={8}
          style={{ width: "100%", marginTop: "6px" }}
        />
        <br />
        <button type="submit" disabled={loading} style={{ marginTop: "8px" }}>
          {loading ? "Formatting..." : "Format Text"}
        </button>
      </form>

      {error && (
        <div style={{ color: "red", marginTop: "16px" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {output && (
        <div style={{ marginTop: "16px" }}>
          <h3>Formatted Output:</h3>
          <pre style={{ background: "#f9f9f9", padding: "15px", border: "1px solid #ccc", whiteSpace: "pre-wrap" }}>
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}
