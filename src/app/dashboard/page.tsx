"use client";

import { useState, useActionState, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { uploadAction } from "@/app/actions/upload";

export default function EnterpriseDashboard() {
  const [chatInput, setChatInput] = useState("");
  const { messages, sendMessage, status } = useChat();

  const [uploadState, formAction, isUploading] = useActionState(
    uploadAction,
    null,
  );

  useEffect(() => {
    const root = document.documentElement;
    const savedTheme = window.localStorage.getItem("atlas-theme");
    const systemIsLight = window.matchMedia(
      "(prefers-color-scheme: light)",
    ).matches;
    const initialTheme =
      savedTheme === "light" || savedTheme === "dark"
        ? (savedTheme as "light" | "dark")
        : systemIsLight
          ? "light"
          : "dark";

    root.classList.toggle("light", initialTheme === "light");
  }, []);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || status !== "ready") return;
    await sendMessage({ text: chatInput });
    setChatInput("");
  };

  return (
    <div className="flex min-h-screen bg-surface text-app-text transition-colors duration-300 selection:bg-primary-container/30 selection:text-app-text">
      <aside className="flex w-80 shrink-0 flex-col gap-6 bg-surface-container-low p-6">
        <div>
          <h2 className="mb-1 font-mono text-xl font-bold lowercase tracking-tight text-app-text">
            atlas brain
          </h2>
          <p className="font-mono text-[11px] uppercase tracking-widest text-app-muted">
            {"// knowledge_manager"}
          </p>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <form action={formAction} className="flex flex-col gap-4">
            <label className="group flex min-h-32 w-full cursor-pointer flex-col items-center justify-center bg-surface-container-high px-4 py-8 text-center ghost-border border-dashed transition-colors hover:bg-surface-bright">
              <span className="font-mono text-xs uppercase tracking-wide text-app-muted transition-colors group-hover:text-primary-container">
                {isUploading ? "[ SYNCING... ]" : "[ DROP_PDF ]"}
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
              className="glow-primary flex h-12 w-full items-center justify-center bg-primary-container font-mono text-sm font-bold uppercase tracking-wide text-on-primary-fixed transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isUploading ? "PROCESSING..." : "> ADD_TO_KNOWLEDGE"}
            </button>
            {uploadState?.success && (
              <p className="text-center font-mono text-xs font-medium text-secondary-container">
                [ ✓ ] document internalized
              </p>
            )}
          </form>
        </div>
      </aside>

      <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-surface">
        <div className="grid-paper flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-8 pb-36 sm:px-10">
          {messages.length === 0 && (
            <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
              <p className="mb-3 font-mono text-3xl text-primary-container/35">
                [ ]
              </p>
              <p className="mb-2 font-mono text-lg font-medium lowercase text-app-text">
                your brain is ready
              </p>
              <p className="max-w-md font-body text-sm leading-relaxed text-app-muted">
                Upload a PDF and ask anything about it.
              </p>
            </div>
          )}

          <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col gap-1 ${m.role === "user" ? "items-end" : "items-start"}`}
              >
                <span className="font-mono text-[10px] uppercase tracking-wider text-app-muted">
                  {m.role === "user" ? "[ operator ]" : "[ atlas ]"}
                </span>
                <div
                  className={`max-w-[85%] px-5 py-4 font-body text-sm leading-relaxed sm:max-w-[80%] ${
                    m.role === "user"
                      ? "bg-primary-container text-on-primary-fixed"
                      : "ghost-border bg-surface-container-high text-app-text"
                  }`}
                >
                  {m.parts.map((part, i) =>
                    part.type === "text" ? <p key={i}>{part.text}</p> : null,
                  )}
                </div>
              </div>
            ))}
            {status === "streaming" && (
              <p className="font-mono text-xs font-bold uppercase tracking-wide text-primary-container animate-pulse">
                &gt; atlas is thinking...
              </p>
            )}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-surface via-surface/90 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-4 sm:px-10">
          <form
            onSubmit={handleChatSubmit}
            className="relative mx-auto max-w-3xl"
          >
            <input
              className="w-full border-b border-outline-variant bg-surface-container-low px-4 py-4 pr-28 font-mono text-sm text-app-text placeholder:text-app-muted/40 focus:border-primary-container focus:outline-none disabled:opacity-50"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="query your internal data..."
              disabled={status !== "ready"}
            />
            <button
              type="submit"
              className="absolute right-0 top-1/2 h-10 -translate-y-1/2 bg-primary-container px-6 font-mono text-sm font-bold uppercase tracking-wide text-on-primary-fixed transition-opacity hover:opacity-90 disabled:opacity-50"
              disabled={!chatInput.trim() || status !== "ready"}
            >
              send
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
