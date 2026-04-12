"use client";

import { useState, useActionState, useEffect, useCallback, startTransition } from "react";
import { useChat } from "@ai-sdk/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { uploadAction } from "@/app/actions/upload";
import { logoutAction } from "@/app/actions/auth";
import {
  getUserDocuments,
  deleteUserDocument,
  type UserDocument,
} from "@/app/actions/documents";
import {
  getUserChats,
  getChatMessages,
  type ChatSession,
} from "@/app/actions/chat";
import { createClient } from "@/lib/supabase/client";
import { UploadTab } from "./components/UploadTab";
import { DocumentsTab } from "./components/DocumentsTab";
import { HistoryTab } from "./components/HistoryTab";

export default function EnterpriseDashboard() {
  const [currentChatId, setCurrentChatId] = useState<string>("");
  const [chatInput, setChatInput] = useState("");
  
  // Set initial chatId on mount to avoid hydration mismatch
  useEffect(() => {
    setCurrentChatId(crypto.randomUUID());
  }, []);

  const { messages, sendMessage, status, setMessages } = useChat({
    id: currentChatId || "empty",
  });

  const [uploadState, formAction, isUploading] = useActionState(
    uploadAction,
    null,
  );
  // User state
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Documents state
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);

  // Sidebar tab state
  const [sidebarTab, setSidebarTab] = useState<"upload" | "documents" | "history">(
    "upload",
  );

  // Chats state
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [chatsLoading, setChatsLoading] = useState(true);

  // Theme init
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

  // Fetch user on mount
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? null);
    });
  }, []);

  // Fetch documents
  const fetchDocuments = useCallback(async () => {
    setDocsLoading(true);
    const result = await getUserDocuments();
    setDocuments(result.documents);
    setDocsLoading(false);
  }, []);

  // Fetch chats
  const fetchChats = useCallback(async () => {
    setChatsLoading(true);
    const result = await getUserChats();
    if (result.success) {
      setChats(result.chats || []);
    }
    setChatsLoading(false);
  }, []);

  useEffect(() => {
    fetchDocuments();
    fetchChats();
  }, [fetchDocuments, fetchChats]);

  // Re-fetch documents after upload succeeds
  useEffect(() => {
    if (uploadState?.success) {
      fetchDocuments();
    }
  }, [uploadState, fetchDocuments]);

  const handleSelectChat = async (id: string) => {
    setCurrentChatId(id);
    const result = await getChatMessages(id);
    if (result.success) {
      setMessages(result.messages);
    }
  };

  const handleNewChat = () => {
    setCurrentChatId(crypto.randomUUID());
    setMessages([]);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || status !== "ready") return;
    
    const input = chatInput;
    setChatInput("");
    
    await sendMessage({ text: input });

    // Optionally refetch chats after sending message if new chat was created
    if (messages.length === 0) {
      setTimeout(fetchChats, 2000); 
    }
  };

  return (
    <div className="flex min-h-screen bg-surface text-app-text transition-colors duration-300 selection:bg-primary-container/30 selection:text-app-text">
      {/* ── SIDEBAR ── */}
      <aside className="flex w-80 shrink-0 flex-col bg-surface-container-low">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <h2 className="mb-1 font-mono text-xl font-bold lowercase tracking-tight text-app-text">
            atlas brain
          </h2>
          <p className="font-mono text-[11px] uppercase tracking-widest text-app-muted">
            {"// knowledge_manager"}
          </p>
        </div>

        {/* User info */}
        <div className="mx-6 mb-4 flex items-center gap-3 bg-surface-container-high px-4 py-3">
          <div className="flex size-7 shrink-0 items-center justify-center bg-primary-container font-mono text-xs font-bold text-on-primary-fixed">
            {userEmail?.charAt(0).toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-mono text-xs text-app-text">
              {userEmail ?? "loading..."}
            </p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="font-mono text-[10px] uppercase tracking-wider text-app-muted transition-colors hover:text-primary-container"
              title="Sign out"
            >
              [exit]
            </button>
          </form>
        </div>

        {/* Tab navigation */}
        <div className="mx-6 mb-4 flex gap-1 font-mono text-[10px] sm:text-xs uppercase tracking-wider overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setSidebarTab("upload")}
            className={`flex-1 px-2 py-2 text-center transition-colors whitespace-nowrap ${
              sidebarTab === "upload"
                ? "bg-surface-container-high text-primary-container"
                : "text-app-muted hover:text-app-text"
            }`}
          >
            {">"} upload
          </button>
          <button
            type="button"
            onClick={() => setSidebarTab("documents")}
            className={`flex-1 px-2 py-2 text-center transition-colors whitespace-nowrap ${
              sidebarTab === "documents"
                ? "bg-surface-container-high text-primary-container"
                : "text-app-muted hover:text-app-text"
            }`}
          >
            {">"} docs
            {documents.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center bg-primary-container px-1.5 py-px text-[9px] font-bold text-on-primary-fixed">
                {documents.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setSidebarTab("history")}
            className={`flex-1 px-2 py-2 text-center transition-colors whitespace-nowrap ${
              sidebarTab === "history"
                ? "bg-surface-container-high text-primary-container"
                : "text-app-muted hover:text-app-text"
            }`}
          >
            {">"} hist
          </button>
        </div>

        {/* Tab content */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-6">
          {sidebarTab === "upload" ? (
            <UploadTab 
              isUploading={isUploading} 
              uploadState={uploadState} 
              formAction={formAction} 
            />
          ) : sidebarTab === "documents" ? (
            <DocumentsTab 
              documents={documents} 
              docsLoading={docsLoading} 
              setDocuments={setDocuments} 
              setSidebarTab={setSidebarTab} 
            />
          ) : (
            <HistoryTab 
              chats={chats} 
              chatsLoading={chatsLoading} 
              setChats={setChats} 
              currentChatId={currentChatId} 
              handleSelectChat={handleSelectChat} 
              handleNewChat={handleNewChat} 
            />
          )}
        </div>
      </aside>

      {/* ── MAIN CHAT AREA ── */}
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
                  {m.parts && m.parts.map((part, i) =>
                    part.type === "text" ? (
                      <div key={i} className="prose-atlas">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {part.text}
                        </ReactMarkdown>
                      </div>
                    ) : null,
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
