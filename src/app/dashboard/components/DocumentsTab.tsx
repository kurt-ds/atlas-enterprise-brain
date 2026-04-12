import { useState } from "react";
import { deleteUserDocument, type UserDocument } from "@/app/actions/documents";

interface DocumentsTabProps {
  documents: UserDocument[];
  docsLoading: boolean;
  setDocuments: React.Dispatch<React.SetStateAction<UserDocument[]>>;
  setSidebarTab: (tab: "upload" | "documents" | "history") => void;
}

export function DocumentsTab({ documents, docsLoading, setDocuments, setSidebarTab }: DocumentsTabProps) {
  const [deletingFile, setDeletingFile] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleDelete = async (fileName: string) => {
    setDeletingFile(fileName);
    const result = await deleteUserDocument(fileName);
    if (result.success) {
      setDocuments((prev) => prev.filter((d) => d.fileName !== fileName));
    }
    setDeletingFile(null);
    setConfirmDelete(null);
  };

  return (
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
  );
}
