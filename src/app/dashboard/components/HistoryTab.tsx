import { useState } from "react";
import { deleteChat, type ChatSession } from "@/app/actions/chat";

interface HistoryTabProps {
  chats: ChatSession[];
  chatsLoading: boolean;
  setChats: React.Dispatch<React.SetStateAction<ChatSession[]>>;
  currentChatId: string;
  handleSelectChat: (id: string) => void;
  handleNewChat: () => void;
}

export function HistoryTab({
  chats,
  chatsLoading,
  setChats,
  currentChatId,
  handleSelectChat,
  handleNewChat,
}: HistoryTabProps) {
  const [deletingChat, setDeletingChat] = useState<string | null>(null);
  const [confirmDeleteChat, setConfirmDeleteChat] = useState<string | null>(null);

  const handleDeleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingChat(id);
    const result = await deleteChat(id);
    if (result.success) {
      setChats((prev) => prev.filter((c) => c.id !== id));
      if (currentChatId === id) {
        handleNewChat();
      }
    }
    setDeletingChat(null);
    setConfirmDeleteChat(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleNewChat}
        className="group flex w-full items-center justify-center gap-2 bg-surface-container-high px-4 py-3 font-mono text-xs font-medium uppercase tracking-wider text-app-text transition-colors hover:bg-surface-bright hover:text-primary-container"
      >
        <span>[+] new session</span>
      </button>

      {chatsLoading ? (
        <p className="py-8 text-center font-mono text-xs uppercase tracking-wide text-app-muted animate-pulse">
          loading history...
        </p>
      ) : chats.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <p className="font-mono text-xs uppercase tracking-wide text-app-muted">
            no active sessions
          </p>
        </div>
      ) : (
        chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => handleSelectChat(chat.id)}
            className={`group relative flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-surface-bright ${
              currentChatId === chat.id
                ? "bg-surface-bright border-l-2 border-primary-container"
                : "bg-surface-container-high"
            }`}
          >
            {!currentChatId || currentChatId !== chat.id ? (
              <div className="mt-1 h-8 w-0.5 shrink-0 bg-secondary-container/30" />
            ) : null}

            <div className="min-w-0 flex-1">
              <p
                className="truncate font-mono text-xs font-medium text-app-text"
                title={chat.title}
              >
                {chat.title}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-app-muted">
                {new Date(chat.created_at).toLocaleDateString()}
              </p>
            </div>

            {/* Delete button */}
            {confirmDeleteChat === chat.id ? (
              <div className="flex shrink-0 gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={(e) => handleDeleteChat(chat.id, e)}
                  disabled={deletingChat === chat.id}
                  className="font-mono text-[10px] uppercase tracking-wider text-red-400 transition-colors hover:text-red-300 disabled:opacity-50"
                >
                  {deletingChat === chat.id ? "[...]" : "[yes]"}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDeleteChat(null);
                  }}
                  className="font-mono text-[10px] uppercase tracking-wider text-app-muted transition-colors hover:text-app-text"
                >
                  [no]
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDeleteChat(chat.id);
                }}
                className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-app-muted opacity-0 transition-all group-hover:opacity-100 hover:text-red-400"
                title={`Delete ${chat.title}`}
              >
                [del]
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}
