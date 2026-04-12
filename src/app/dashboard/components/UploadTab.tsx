import { useState, startTransition } from "react";

interface UploadTabProps {
  isUploading: boolean;
  uploadState: any;
  formAction: (payload: FormData) => void;
}

export function UploadTab({ isUploading, uploadState, formAction }: UploadTabProps) {
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

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

  const handleUploadSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stagedFile || isUploading) return;

    const data = new FormData();
    data.append("file", stagedFile);
    startTransition(() => {
      formAction(data);
    });
    setStagedFile(null);
  };

  return (
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
  );
}
