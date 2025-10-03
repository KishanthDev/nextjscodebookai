"use client";
import { useState } from "react";
import BotSelector from "@/components/agent-training/SelectBots";

export default function QAPostForm() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [botId, setBotId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!botId) {
      setMessage("❌ Please select a bot first.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/agent-training/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botId, question, answer }), // 👈 send botId
      });

      if (res.ok) {
        setMessage("✅ QA pair saved successfully!");
        setQuestion("");
        setAnswer("");
      } else {
        const error = await res.json();
        setMessage(`❌ Error: ${error.error}`);
      }
    } catch (err) {
      setMessage("❌ Failed to save QA pair.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-md mt-10">
      <h2 className="text-xl font-bold mb-4">Add a QA Pair</h2>

      <BotSelector onSelect={(id) => setBotId(id)} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Question</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Answer</label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={4}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save QA"}
        </button>
      </form>

      {message && <p className="mt-4 text-center text-sm">{message}</p>}
    </div>
  );
}
