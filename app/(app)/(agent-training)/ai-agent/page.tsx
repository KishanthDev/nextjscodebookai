"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import BotSelector from "@/components/agent-training/SelectBots"; // 👈 your bot dropdown

const MAX_URLS = 10;

type Site = {
  url: string;
  slug: string;       // bot name
  createdAt?: string; // ISO date string
  botId?: string;     // 👈 added
};

export default function WebsitesTable() {
  const [url, setUrl] = useState("");
  const [urls, setUrls] = useState<Site[]>([]);
  const [botId, setBotId] = useState(""); // 👈 selected bot
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchUrls = async () => {
    try {
      const res = await fetch("/api/agent-training/url");
      const data = await res.json();
      setUrls(data.sites || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch URLs");
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const handleUpload = async () => {
    if (!url || !botId || urls.length >= MAX_URLS) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/agent-training/url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, botId }), // 👈 include botId
      });
      const data = await res.json();
      if (data.success) {
        setUrl("");
        if (data.site) {
          setUrls((prev) => [...prev, data.site]);
        } else {
          fetchUrls();
        }
      } else {
        setError(data.error || "Upload failed");
      }
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Upload Section */}
      <Card className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Upload Website URL</h2>
          <span className="text-sm text-gray-600">
            {urls.length} / {MAX_URLS} uploaded
          </span>
        </div>

        {/* 👇 Bot Selector */}
        <BotSelector onSelect={(id) => setBotId(id)} />

        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <Input
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1"
            disabled={urls.length >= MAX_URLS}
          />
          <Button
            onClick={handleUpload}
            disabled={loading || urls.length >= MAX_URLS || !botId}
            className={`flex items-center gap-2 ${loading || urls.length >= MAX_URLS || !botId
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {loading
              ? "Uploading..."
              : urls.length >= MAX_URLS
                ? "Limit Reached"
                : (
                  <>
                    <Plus size={16} /> Upload
                  </>
                )}
          </Button>
        </div>

        {error && <p className="text-red-600">{error}</p>}
      </Card>
    </div>
  );
}
