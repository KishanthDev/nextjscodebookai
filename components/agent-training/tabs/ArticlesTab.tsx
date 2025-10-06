"use client";
import { useEffect, useState } from "react";
import BotSelector from "@/components/agent-training/SelectBots";

type Article = {
  _id: string;
  title: string;
  content: string;
  link?: string;
  parent_category?: string;
  categories?: string[];
  createdAt?: string;
};

export default function ArticlesPage() {
  const [botId, setBotId] = useState<string>("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);

  // form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [link, setLink] = useState("");
  const [parentCategory, setParentCategory] = useState("");
  const [categories, setCategories] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (botId) {
      setLoading(true);
      loadArticles();
    }
  }, [botId]);

  const loadArticles = async () => {
    try {
      const res = await fetch(`/api/agent-training/articles?botId=${botId}`);
      const data = await res.json();
      setArticles(data);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!botId) {
      setMessage("❌ Please select a bot first.");
      return;
    }
    const newArticle = {
      botId,
      title,
      content,
      link,
      parent_category: parentCategory,
      categories: categories.split(",").map((c) => c.trim()),
    };

    await fetch("/api/agent-training/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newArticle),
    });

    loadArticles();
    setTitle("");
    setContent("");
    setLink("");
    setParentCategory("");
    setCategories("");
  };

  return (
    <div className="prose max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Knowledge Base Articles</h1>

      {/* ✅ Always visible */}
      <BotSelector onSelect={setBotId} />

      {!botId && <p className="mt-4 text-gray-600">👉 Please select a bot to load articles.</p>}
      {botId && loading && <p>Loading...</p>}

      {botId && !loading && (
        <>
          {/* Add New Article Form */}
          <form
            onSubmit={handleSubmit}
            className="mb-8 p-4 border rounded-lg bg-gray-50"
          >
            <h2 className="text-lg font-semibold mb-2">Add New Article</h2>

            <input
              type="text"
              placeholder="Title"
              className="w-full border rounded p-2 mb-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <textarea
              placeholder="Content"
              className="w-full border rounded p-2 mb-2"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="External Link (optional)"
              className="w-full border rounded p-2 mb-2"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />

            <input
              type="text"
              placeholder="Parent Category (e.g. Chatbot)"
              className="w-full border rounded p-2 mb-2"
              value={parentCategory}
              onChange={(e) => setParentCategory(e.target.value)}
            />

            <input
              type="text"
              placeholder="Categories (comma separated)"
              className="w-full border rounded p-2 mb-2"
              value={categories}
              onChange={(e) => setCategories(e.target.value)}
            />

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Post Article
            </button>
          </form>

          {/* Articles List */}
          {articles.length === 0 ? (
            <p className="text-gray-500">No articles available.</p>
          ) : (
            <ul className="space-y-6">
              {articles.map((a) => (
                <li key={a._id} className="p-4 border rounded-lg shadow-sm">
                  <h2 className="text-xl font-semibold">{a.title}</h2>
                  {a.parent_category && (
                    <p className="text-sm text-gray-600">
                      Category: {a.parent_category}
                    </p>
                  )}
                  {a.categories && a.categories.length > 0 && (
                    <p className="text-sm text-gray-500">
                      Tags: {a.categories.join(", ")}
                    </p>
                  )}
                  <div className="mt-2 text-gray-800">{a.content}</div>
                  {a.link && (
                    <a
                      href={a.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline mt-2 block"
                    >
                      Read more
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
