"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";
import BotsPage from "@/components/agent-bots/BotsPage";
import Chat from "@/components/agent-bots/Chat";

// Static tab
const staticTabs = [
  {
    id: "create-bot",
    label: "Create Bot",
    component: <BotsPage />,
  },
];

export default function OpenAIPage() {
  const [bots, setBots] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(staticTabs[0].id);

  // Fetch bots on mount
  useEffect(() => {
    const fetchBots = async () => {
      try {
        const res = await fetch("/api/agent-training/bots");
        const data = await res.json();
        setBots(data);
      } catch (err) {
        console.error("Failed to fetch bots", err);
      }
    };
    fetchBots();
  }, []);

  // Combine static + dynamic tabs
  const allTabs = [
    ...staticTabs,
    ...bots.map((bot) => ({
      id: bot._id,
      label: bot.name || "Bot",
      component: <Chat botId={bot._id} botName={bot.name} />,
    })),
  ];

  const activeComponent = allTabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Sidebar */}
      <div className="w-[180px] border-r p-2 bg-gray-50 dark:bg-zinc-900">
        <nav className="flex flex-col gap-2">
          {allTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "text-left px-3 py-2 rounded-md text-sm font-medium capitalize truncate",
                {
                  "bg-blue-100 text-blue-900 dark:bg-blue-800 dark:text-white":
                    activeTab === tab.id,
                  "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800":
                    activeTab !== tab.id,
                }
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">{activeComponent}</div>
    </div>
  );
}
