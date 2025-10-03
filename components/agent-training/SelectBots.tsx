"use client";

import { useEffect, useState } from "react";

interface Bot {
  _id: string;
  name: string;
}

export default function BotSelector({ onSelect }: { onSelect: (botId: string) => void }) {
  const [bots, setBots] = useState<Bot[]>([]);
  const [selected, setSelected] = useState<string>("");

  useEffect(() => {
    // Fetch list of bots from API
    const fetchBots = async () => {
      try {
        const res = await fetch("/api/agent-training/bots");
        const data = await res.json();
        setBots(data);
      } catch (err) {
        console.error("Failed to load bots", err);
      }
    };
    fetchBots();
  }, []);

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium">Select Bot</label>
      <select
        value={selected}
        onChange={(e) => {
          setSelected(e.target.value);
          onSelect(e.target.value);
        }}
        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {/* Placeholder option */}
        <option value="" disabled>
          -- Select Bot --
        </option>

        {bots.map((bot) => (
          <option key={bot._id} value={bot._id}>
            {bot.name}
          </option>
        ))}
      </select>
    </div>
  );
}
