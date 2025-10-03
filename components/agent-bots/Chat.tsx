import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import CodeBlock from "./CodeBlock";

type Message =
  | { role: "user"; text: string }
  | { role: "assistant"; type: "text"; text: string }
  | {
    role: "assistant";
    type: "buttons";
    text: string;
    buttons: { label: string; action: string }[];
  }
  | {
    role: "assistant";
    type: "action";
    text: string;
    label: string;
    action: string;
  };

interface Conversation {
  _id: string;
  name?: string;
  messages?: Message[];
}

interface AskPageProps {
  botId: string;
  botName: string;
}

export default function AskPage({ botId, botName }: AskPageProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [convId, setConvId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  /** 📌 Load all conversations for this bot */
  useEffect(() => {
    // Reset convId and messages whenever bot changes
    setConvId(null);
    setMessages([]);

    async function fetchConversations() {
      try {
        const res = await fetch(`/api/agent-training/conversations?botId=${botId}`);
        if (res.ok) {
          const data = await res.json();
          setConversations(data);
        } else {
          setConversations([]);
        }
      } catch (err) {
        console.error("Failed to load conversations:", err);
        setConversations([]);
      }
    }

    fetchConversations();
  }, [botId]);


  /** 📌 Load messages when convId changes */
  useEffect(() => {
    async function fetchConversation() {
      if (!convId) {
        setMessages([]);
        return;
      }
      try {
        const res = await fetch(`/api/agent-training/conversations/${convId}?botId=${botId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.error("Failed to load conversation:", err);
      }
    }
    fetchConversation();
  }, [convId, botId]);

  /** 📌 Auto scroll to bottom */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /** 📌 Send message */
  /** 📌 Send message */
  const handleAsk = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: input }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/agent-training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input, botId, convId }),
      });

      const contentType = res.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        // ✅ JSON reply (QA, flows, articles)
        const data = await res.json();

        // Update convId immediately if new
        if (data.convId && convId !== data.convId) {
          setConvId(data.convId);
          setConversations((prev) =>
            prev.find((c) => c._id === data.convId)
              ? prev
              : [...prev, { _id: data.convId, name: "New Conversation" }]
          );
        }

        setMessages((prev) => [
          ...prev,
          { role: "assistant", ...data, type: data.type || "text" },
        ]);
      } else if (contentType.includes("text/event-stream")) {
        // ✅ Streaming reply (PDFs, websites)
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let botReply = "";
        let currentConvId = convId; // store convId from stream

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true }).trim();
          if (!chunk) continue;

          // Parse SSE-style JSON chunk: "data: { ... }"
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            const jsonStr = line.replace(/^data:\s*/, "");
            try {
              const parsed = JSON.parse(jsonStr);

              // Update convId if received in stream
              if (parsed.convId && currentConvId !== parsed.convId) {
                currentConvId = parsed.convId;
                setConvId(parsed.convId);
                setConversations((prev) =>
                  prev.find((c) => c._id === parsed.convId)
                    ? prev
                    : [...prev, { _id: parsed.convId, name: "New Conversation" }]
                );
              }

              // Append streamed text
              if (parsed.text) {
                botReply += parsed.text;
                setMessages((prev) => {
                  const copy = [...prev];
                  if (copy[copy.length - 1]?.role === "assistant") {
                    (copy[copy.length - 1] as any).text = botReply;
                  } else {
                    copy.push({ role: "assistant", type: "text", text: botReply });
                  }
                  return copy;
                });
              }
            } catch (e) {
              console.warn("Failed to parse SSE chunk:", line);
            }
          }
        }
      } else {
        // Fallback if unknown content type
        const text = await res.text();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", type: "text", text },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", type: "text", text: "❌ Something went wrong." },
      ]);
    } finally {
      setLoading(false);
    }
  };



  /** Edit conversation name */
  const handleEditConversation = async () => {
    if (!convId) return;
    const newName = prompt("Enter new conversation name:");
    if (!newName) return;

    try {
      await fetch(`/api/agent-training/conversations/${convId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, botId }), // ✅ send botId
      });
      setConversations((prev) =>
        prev.map((c) => (c._id === convId ? { ...c, name: newName } : c))
      );
    } catch (err) {
      console.error("Error renaming:", err);
    }
  };

  /** Delete conversation */
  const handleDeleteConversation = async () => {
    if (!convId) return;
    if (!confirm("Are you sure you want to delete this conversation?")) return;

    try {
      await fetch(`/api/agent-training/conversations/${convId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botId }), // ✅ send botId
      });
      setConversations((prev) => prev.filter((c) => c._id !== convId));
      setMessages([]);
      setConvId(null);
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };


  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-gray-100">
      {/* Header */}
      <header className="bg-green-500 text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="text-lg font-semibold">🤖 Chat with Bot: {botName}</span>

          <select
            value={convId || ""}
            onChange={(e) => setConvId(e.target.value || null)}
            className="px-3 py-2 rounded-md text-black"
          >
            <option value="">+ New Conversation</option>
            {conversations.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name || `Conversation ${c._id.slice(-4)}`}
              </option>
            ))}
          </select>
        </div>

        {convId && (
          <div className="flex gap-2">
            <button
              onClick={handleEditConversation}
              className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              ✏️ Rename
            </button>
            <button
              onClick={handleDeleteConversation}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              🗑️ Delete
            </button>
          </div>
        )}
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && !loading && (
          <p className="text-gray-500 text-center mt-10 italic">
            Ask me anything to get started!
          </p>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-4 py-2 rounded-2xl shadow ${msg.role === "user"
                ? "max-w-xs bg-green-500 text-white rounded-br-none"
                : "w-full bg-white text-gray-800 rounded-bl-none"
                }`}
            >
              {msg.role === "assistant" && msg.type === "buttons" ? (
                <div>
                  <p className="mb-2">{msg.text}</p>
                  <div className="flex flex-col gap-2">
                    {msg.buttons.map((btn, j) => (
                      <button
                        key={j}
                        className="px-3 py-2 rounded bg-green-500 text-white hover:bg-green-600"
                        onClick={() => {
                          if (btn.action.startsWith("redirect:")) {
                            window.open(btn.action.replace("redirect:", ""), "_blank");
                          } else {
                            setInput(btn.label);
                          }
                        }}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : msg.role === "assistant" && msg.type === "action" ? (
                <div>
                  <p>{msg.text}</p>
                </div>
              ) : msg.role === "assistant" && msg.type === "text" ? (
                <div className="prose max-w-none">
                  <ReactMarkdown
                    components={{
                      code: CodeBlock,
                      h1: ({ node, ...props }) => (
                        <h1 className="text-xl font-bold my-2" {...props} />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2 className="text-lg font-semibold my-2" {...props} />
                      ),
                      li: ({ node, ...props }) => (
                        <li className="list-disc ml-6" {...props} />
                      ),
                      ul: ({ node, ...props }) => <ul className="mb-2" {...props} />,
                      strong: ({ node, ...props }) => (
                        <strong className="font-bold" {...props} />
                      ),
                      em: ({ node, ...props }) => <em className="italic" {...props} />,
                      p: ({ node, ...props }) => <p className="my-2" {...props} />,
                      a: ({ node, ...props }) => (
                        <a
                          className="text-blue-600 underline hover:text-blue-800"
                          target="_blank"
                          rel="noopener noreferrer"
                          {...props}
                        />
                      ),
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>
              ) : (
                <p>{msg.text}</p>
              )}
            </div>
          </div>
        ))}

        <div ref={chatEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-white border-t border-gray-300 flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          placeholder="Type your question..."
          className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50"
        />
        <button
          onClick={handleAsk}
          disabled={loading}
          className="px-5 py-2 bg-green-500 text-white rounded-full font-medium hover:bg-green-600 transition disabled:opacity-50"
        >
          {loading ? "..." : "Ask 🚀"}
        </button>
      </div>
    </div>
  );
}
