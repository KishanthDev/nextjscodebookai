"use client";
import { useState } from "react";

export default function HtmlToParagraphsForm() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [paragraphs, setParagraphs] = useState<[string, string, string][]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setParagraphs([]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/html-to-paragraphs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Unknown error");
      } else {
        setParagraphs(data.paragraphs || []);
      }
    } catch (err: any) {
      setError(err.message || "Unexpected error");
    }

    setLoading(false);
  }

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h2>Parse Web Page to Paragraphs</h2>
      {error && (
        <div style={{ color: "red", marginBottom: "1rem" }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        <label>
          Enter URL: <br />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            style={{ width: "400px" }}
            required
          />
        </label>
        <br />
        <button type="submit" style={{ marginTop: "0.5rem" }} disabled={loading}>
          {loading ? "Parsing..." : "Parse Page"}
        </button>
      </form>

      {paragraphs.length > 0 && (
        <div>
          <h3>Extracted Paragraphs:</h3>
          {paragraphs.map(([text, lang, source], i) => (
            <div key={i} style={{ marginBottom: "1rem" }}>
              <p><strong>Paragraph {i + 1}</strong> (Lang: {lang || "N/A"})</p>
              <pre style={{ whiteSpace: "pre-wrap" }}>{text}</pre>
              <hr />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
