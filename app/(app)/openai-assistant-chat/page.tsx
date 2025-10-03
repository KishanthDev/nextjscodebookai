'use client'
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot, Paperclip } from 'lucide-react';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message && !file) return;

    setLoading(true);

    const form = new FormData();
    if (file) form.append('file', file);
    if (message) form.append('message', message);

    try {
      const res = await fetch('/api/openai-assistant-chat', {
        method: 'POST',
        body: form,
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }

      const data = await res.json();

      // New user message
      const userMsg: ChatMessage = {
        id: Date.now().toString(), // temporary ID
        role: 'user',
        content: message,
      };

      // Bot messages from response
      const botMessages: ChatMessage[] = data.messages
        .filter((m: any) => m.role === 'assistant')
        .map((m: any) => ({
          id: m.id,
          role: 'assistant',
          content: m.content,
        }));

      // Append user first, then bot
      setMessages((prev) => [...prev, userMsg, ...botMessages]);
      setMessage('');
      setFile(null);
    } catch (err) {
      console.error(err);
      alert('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-53px)] w-full mx-auto">
      {/* Chat area (scrollable) */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white border shadow-sm">
        {messages.length === 0 ? (
          <p className="text-gray-400 text-center mt-20">No conversation yet</p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${m.role === "user" ? "justify-end" : "justify-start"
                }`}
            >
              {/* Bot avatar */}
              {m.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-gray-600" />
                </div>
              )}

              {/* Message bubble */}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-relaxed shadow-sm ${m.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-900"
                  }`}
              >
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>

              {/* User avatar */}
              {m.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Selected file preview (fixed above input) */}
      {file && (
        <div className="px-4 py-2 bg-gray-100 border-t text-sm text-gray-700 flex items-center justify-between">
          <span className="truncate max-w-[80%]">{file.name}</span>
          <button
            type="button"
            onClick={() => setFile(null)}
            className="ml-2 text-red-500 hover:text-red-700 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input (always fixed at bottom) */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t p-4 bg-gray-50"
      >
        {/* Input wrapper */}
        <div className="flex items-center flex-1 border rounded-lg px-2 bg-white focus-within:ring focus-within:border-blue-500">
          {/* Attachment button */}
          <label className="cursor-pointer p-2 text-gray-500 hover:text-gray-700 flex items-center">
            <Paperclip className="w-5 h-5" />
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>

          {/* Text input */}
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 outline-none"
          />
        </div>

        {/* Send button */}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "..." : "Send"}
        </button>
      </form>
    </div>

  );
}
