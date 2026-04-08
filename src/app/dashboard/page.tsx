"use client";

import { useState, useActionState, useEffect, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { uploadAction } from "@/app/actions/upload";
import { logoutAction } from "@/app/actions/auth";
import {
  getUserDocuments,
  deleteUserDocument,
  type UserDocument,
} from "@/app/actions/documents";
import { createClient } from "@/lib/supabase/client";

export default function EnterpriseDashboard() {
  const [chatInput, setChatInput] = useState("");
  const { messages, sendMessage, status } = useChat();

  const [uploadState, formAction, isUploading] = useActionState(
    uploadAction,
    null,
  );
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  // User state
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Documents state
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [deletingFile, setDeletingFile] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Sidebar tab state
  const [sidebarTab, setSidebarTab] = useState<"upload" | "documents">(
    "upload",
  );

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

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Re-fetch documents after upload succeeds
  useEffect(() => {
    if (uploadState?.success) {
      fetchDocuments();
    }
  }, [uploadState, fetchDocuments]);

  // Handle document delete
  const handleDelete = async (fileName: string) => {
    setDeletingFile(fileName);
    const result = await deleteUserDocument(fileName);
    if (result.success) {
      setDocuments((prev) => prev.filter((d) => d.fileName !== fileName));
    }
    setDeletingFile(null);
    setConfirmDelete(null);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || status !== "ready") return;
    await sendMessage({ text: chatInput });
    setChatInput("");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFileSelection = (file: File | null) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setStagedFile(null);
      return;
    }
    setStagedFile(file);
  };

  const handleUploadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stagedFile || isUploading) return;

    const data = new FormData();
    data.append("file", stagedFile);
    await formAction(data);
    setStagedFile(null);
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
        <div className="mx-6 mb-4 flex gap-0 font-mono text-xs uppercase tracking-wider">
          <button
            type="button"
            onClick={() => setSidebarTab("upload")}
            className={`flex-1 px-3 py-2 text-center transition-colors ${
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
            className={`flex-1 px-3 py-2 text-center transition-colors ${
              sidebarTab === "documents"
                ? "bg-surface-container-high text-primary-container"
                : "text-app-muted hover:text-app-text"
            }`}
          >
            {">"} documents
            {documents.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center bg-primary-container px-1.5 py-px text-[9px] font-bold text-on-primary-fixed">
                {documents.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab content */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-6">
          {sidebarTab === "upload" ? (
            /* ── UPLOAD TAB ── */
            <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4">
              <label
                onDragEnter={(e) => {
                  e.preventDefault();
                  setIsDragActive(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragActive(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragActive(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragActive(false);
                  handleFileSelection(e.dataTransfer.files?.[0] ?? null);
                }}
                className={`group flex min-h-32 w-full cursor-pointer flex-col items-center justify-center bg-surface-container-high px-4 py-8 text-center ghost-border border-dashed transition-colors hover:bg-surface-bright ${
                  isDragActive ? "border-primary-container bg-surface-bright" : ""
                }`}
              >
                <span className="font-mono text-xs uppercase tracking-wide text-app-muted transition-colors group-hover:text-primary-container">
                  {isUploading ? "[ SYNCING... ]" : "[ DROP_PDF ]"}
                </span>
                <span className="mt-2 font-mono text-[10px] tracking-wider text-app-muted/50">
                  max 5 MB
                </span>
                <input
                  type="file"
                  name="file"
                  className="hidden"
                  accept="application/pdf"
                  disabled={isUploading}
                  onChange={(e) =>
                    handleFileSelection(e.currentTarget.files?.[0] ?? null)
                  }
                />
              </label>
              {stagedFile && (
                <div className="ghost-border bg-surface-container-high px-4 py-3">
                  <p
                    className="truncate font-mono text-xs font-medium text-app-text"
                    title={stagedFile.name}
                  >
                    [ staged ] {stagedFile.name}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-app-muted">
                      {formatFileSize(stagedFile.size)}
                    </p>
                    <button
                      type="button"
                      onClick={() => setStagedFile(null)}
                      className="font-mono text-[10px] uppercase tracking-wider text-app-muted transition-colors hover:text-red-400"
                    >
                      [ clear ]
                    </button>
                  </div>
                </div>
              )}
              <button
                type="submit"
                disabled={isUploading || !stagedFile}
                className="glow-primary flex h-12 w-full items-center justify-center bg-primary-container font-mono text-sm font-bold uppercase tracking-wide text-on-primary-fixed transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isUploading ? "PROCESSING..." : "> ADD_TO_KNOWLEDGE"}
              </button>
              {uploadState?.success && (
                <p className="text-center font-mono text-xs font-medium text-secondary-container">
                  [ ✓ ] document internalized
                </p>
              )}
              {uploadState?.error && (
                <p className="text-center font-mono text-xs font-medium text-red-400">
                  [ ✗ ] {uploadState.error}
                </p>
              )}
            </form>
          ) : (
            /* ── DOCUMENTS TAB ── */
            <div className="flex flex-col gap-2">
              {docsLoading ? (
                <p className="py-8 text-center font-mono text-xs uppercase tracking-wide text-app-muted animate-pulse">
                  scanning vault...
                </p>
              ) : documents.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <p className="font-mono text-2xl text-primary-container/25">
                    [ ]
                  </p>
                  <p className="font-mono text-xs uppercase tracking-wide text-app-muted">
                    no documents yet
                  </p>
                  <button
                    type="button"
                    onClick={() => setSidebarTab("upload")}
                    className="mt-2 font-mono text-xs uppercase tracking-wider text-primary-container transition-opacity hover:opacity-80"
                  >
                    {">"} upload your first pdf
                  </button>
                </div>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.fileName}
                    className="group relative flex items-start gap-3 bg-surface-container-high px-4 py-3 transition-colors hover:bg-surface-bright"
                  >
                    {/* Left accent bar */}
                    <div className="mt-1 h-8 w-0.5 shrink-0 bg-secondary-container/60" />

                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate font-mono text-xs font-medium text-app-text"
                        title={doc.fileName}
                      >
                        {doc.fileName}
                      </p>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-app-muted">
                        {doc.chunkCount} chunks
                      </p>
                    </div>

                    {/* Delete button */}
                    {confirmDelete === doc.fileName ? (
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          onClick={() => handleDelete(doc.fileName)}
                          disabled={deletingFile === doc.fileName}
                          className="font-mono text-[10px] uppercase tracking-wider text-red-400 transition-colors hover:text-red-300 disabled:opacity-50"
                        >
                          {deletingFile === doc.fileName
                            ? "[...]"
                            : "[yes]"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(null)}
                          className="font-mono text-[10px] uppercase tracking-wider text-app-muted transition-colors hover:text-app-text"
                        >
                          [no]
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(doc.fileName)}
                        className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-app-muted opacity-0 transition-all group-hover:opacity-100 hover:text-red-400"
                        title={`Delete ${doc.fileName}`}
                      >
                        [del]
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
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
