"use client";
import BotSelector from "@/components/agent-training/SelectBots";
import { useEffect, useState } from "react";

export default function TrainingStatsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBot, setSelectedBot] = useState<string>("all");

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/agent-training/stats");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Failed to load stats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading training stats...</div>;
  }

  if (!stats) {
    return <div className="p-6 text-red-500">Failed to load training stats.</div>;
  }

  const bots = Object.keys(stats.perBot || {});
  const displayStats =
    selectedBot === "all" ? stats.summary : stats.perBot[selectedBot] || {};

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Training Data Dashboard</h1>

      {/* Bot selector */}
      <BotSelector onSelect={(id) => setSelectedBot(id)} />

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(displayStats).map(([key, count]) => (
          <div
            key={key}
            className="rounded-xl shadow-md p-6 bg-white dark:bg-gray-800"
          >
            <h2 className="text-lg font-semibold capitalize mb-2">{key}</h2>
            <p className="text-3xl font-bold text-blue-600">
              {(count as number).toLocaleString()}
            </p>
            <p className="text-gray-500">words trained</p>
          </div>
        ))}
      </div>
    </div>
  );
}
