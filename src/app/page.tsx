"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";

export default function Chat() {
  // 1. Manually manage your input state
  const [input, setInput] = useState("");

  // 2. useChat now returns a cleaner set of controls
  const { messages, sendMessage, status, error } = useChat();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 3. Use sendMessage instead of handleSubmit
    await sendMessage({ text: input });
    setInput(""); // Clear input manually
  };

  return (
    <main className="flex flex-col h-screen max-w-2xl mx-auto p-4 bg-white text-black">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 border rounded-lg bg-gray-50">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
          >
            <span className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-widest">
              {m.role}
            </span>
            <div
              className={`p-3 rounded-2xl max-w-[85%] shadow-sm ${
                m.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 text-black"
              }`}
            >
              {/* SDK 5.0+ uses the parts structure */}
              {m.parts.map((part, index) => {
                if (part.type === "text") return <p key={index}>{part.text}</p>;
                return null;
              })}
            </div>
          </div>
        ))}
        {status === "streaming" && (
          <div className="text-xs text-blue-500 animate-pulse">
            Llama is typing...
          </div>
        )}
      </div>

      <form onSubmit={handleFormSubmit} className="flex gap-2">
        <input
          className="flex-1 p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          value={input}
          placeholder="Type your message..."
          onChange={(e) => setInput(e.target.value)}
          disabled={status === "streaming"}
        />
        <button
          type="submit"
          disabled={!input.trim() || status === "streaming"}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl font-medium disabled:opacity-50 transition-opacity"
        >
          Send
        </button>
      </form>
      {error && (
        <p className="text-red-500 text-xs mt-2">Error: {error.message}</p>
      )}
    </main>
  );
}
