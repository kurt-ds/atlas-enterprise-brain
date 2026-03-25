"use client";

import { useState, useActionState } from "react";
import { useChat } from "@ai-sdk/react";
import { uploadAction, UploadState } from "@/app/actions/upload";

export default function EnterpriseDashboard() {
  // 1. Chat State
  const [chatInput, setChatInput] = useState("");
  const { messages, sendMessage, status } = useChat();

  // 2. Upload State
  const [uploadState, formAction, isUploading] = useActionState(
    uploadAction,
    null,
  );

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || status !== "ready") return;
    await sendMessage({ text: chatInput });
    setChatInput("");
  };

  return (
    <div className="flex h-screen bg-gray-50 text-black">
      {/* --- SIDEBAR: Document Management --- */}
      <aside className="w-80 border-r bg-white p-6 flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold text-blue-600 mb-1">Atlas Brain</h2>
          <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">
            Knowledge Manager
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form action={formAction} className="flex flex-col gap-3">
            <label className="group flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all text-center px-4">
              <span className="text-sm text-gray-500 font-medium group-hover:text-blue-600">
                {isUploading ? "Syncing..." : "Drop PDF here"}
              </span>
              <input
                type="file"
                name="file"
                className="hidden"
                accept="application/pdf"
                disabled={isUploading}
              />
            </label>
            <button
              type="submit"
              disabled={isUploading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-300 transition-all"
            >
              {isUploading ? "Processing..." : "Add to Knowledge"}
            </button>
            {uploadState?.success && (
              <p className="text-green-500 text-xs text-center font-medium">
                ✓ Document internalized
              </p>
            )}
          </form>
        </div>
      </aside>

      {/* --- MAIN: AI Chat Interface --- */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 pb-32">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <div className="w-16 h-16 bg-gray-200 rounded-full mb-4" />
              <p className="text-lg font-medium">Your Brain is ready.</p>
              <p className="text-sm">
                Upload a PDF and ask me anything about it.
              </p>
            </div>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`p-4 rounded-2xl max-w-[80%] shadow-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-100 text-gray-800"
                }`}
              >
                {m.parts.map((part, i) =>
                  part.type === "text" ? <p key={i}>{part.text}</p> : null,
                )}
              </div>
            </div>
          ))}
          {status === "streaming" && (
            <div className="text-xs text-blue-500 font-bold animate-pulse">
              ATLAS IS THINKING...
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent">
          <form
            onSubmit={handleChatSubmit}
            className="max-w-3xl mx-auto relative group"
          >
            <input
              className="w-full p-5 pr-20 bg-white border border-gray-200 rounded-2xl shadow-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-black"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Query your internal data..."
              disabled={status !== "ready"}
            />
            <button
              type="submit"
              className="absolute right-3 top-3 bottom-3 bg-blue-600 text-white px-6 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-all"
              disabled={!chatInput.trim() || status !== "ready"}
            >
              Send
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
