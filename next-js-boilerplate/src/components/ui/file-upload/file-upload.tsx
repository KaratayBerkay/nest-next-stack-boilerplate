"use client";

import { useRef, useState, useCallback, useId, useMemo } from "react";
import { cn } from "@/lib/cn";
import { Progress } from "@/components/ui/Progress";
import { useToast } from "@/components/ui/toast/use-toast";
import type {
  FileUploadProps,
  UploadFile,
  FileUploadLabels,
} from "@/types/ui/FileUpload-types";

function humanSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

let uploadIdCounter = 0;
function nextId() {
  return `upload-${++uploadIdCounter}`;
}

const DEFAULT_LABELS: FileUploadLabels = {
  dropzoneIdle: "Drag & drop files or click to browse",
  dropzoneActive: "Drop files here",
  acceptedLabel: "Accepted",
  invalidType: (file: string, accepted: string) =>
    `Only ${accepted} can be uploaded — got ${file}`,
  tooLarge: (file: string, max: string) =>
    `File too large (${file}). Max: ${max}`,
  uploaded: "Uploaded",
  uploadFailed: "Upload failed",
  remove: (file: string) => `Remove ${file}`,
  uploadButton: (count: number) => `Upload ${count} file(s)`,
  uploading: "Uploading...",
  changePhoto: "Change",
  removePhoto: "Remove photo",
};

export function FileUpload({
  multiple,
  accept,
  maxSizeBytes,
  maxFiles,
  files,
  onFilesChange,
  onUpload,
  className,
  disabled,
  labels: labelsProp,
}: FileUploadProps) {
  const labels = useMemo(
    () => ({ ...DEFAULT_LABELS, ...labelsProp }),
    [labelsProp],
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const dragCounter = useRef(0);
  const autoId = useId();
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const addFiles = useCallback(
    async (incoming: File[]) => {
      if (disabled) return;
      const maxFilesLimit = maxFiles ?? Infinity;
      const remaining = maxFilesLimit - files.length;
      if (remaining <= 0) return;

      const newFiles: UploadFile[] = [];
      for (const file of incoming.slice(0, remaining)) {
        if (maxSizeBytes && file.size > maxSizeBytes) {
          newFiles.push({
            id: nextId(),
            file,
            progress: 0,
            status: "error",
            error: labels.tooLarge!(
              humanSize(file.size),
              humanSize(maxSizeBytes),
            ),
          });
          continue;
        }

        if (accept) {
          const acceptTypes = accept.split(",").map((t) => t.trim());
          const mimeMatch = acceptTypes.some((type) => {
            if (type.endsWith("/*")) {
              const category = type.slice(0, -2);
              return file.type.startsWith(category + "/");
            }
            return file.type === type;
          });
          if (!mimeMatch) {
            const acceptLabels = accept.split(",").map((t) => {
              const trimmed = t.trim();
              if (trimmed.endsWith("/*")) return trimmed.replace("/*", "s");
              if (trimmed.startsWith("."))
                return trimmed.slice(1).toUpperCase();
              return trimmed;
            });
            toast({
              title: "Invalid file type",
              description: labels.invalidType!(
                file.name,
                acceptLabels.join(", "),
              ),
              variant: "destructive",
            });
            continue;
          }
        }

        newFiles.push({
          id: nextId(),
          file,
          progress: 0,
          status: "pending",
        });
      }

      const updated = [...files, ...newFiles];
      onFilesChange(updated);
    },
    [
      disabled,
      files,
      maxFiles,
      maxSizeBytes,
      onFilesChange,
      accept,
      toast,
      labels,
    ],
  );

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick],
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      dragCounter.current = 0;
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        addFiles(Array.from(e.dataTransfer.files));
      }
    },
    [addFiles],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(Array.from(e.target.files));
        e.target.value = "";
      }
    },
    [addFiles],
  );

  const handleUpload = useCallback(async () => {
    if (!onUpload || uploading) return;
    setUploading(true);
    const pending = files.filter((f) => f.status === "pending");
    for (const f of pending) {
      const uploadingFiles = files.map((x) =>
        x.id === f.id ? { ...x, status: "uploading" as const } : x,
      );
      onFilesChange(uploadingFiles);
      try {
        await onUpload(f.file, (pct: number) => {
          onFilesChange(
            uploadingFiles.map((x) =>
              x.id === f.id ? { ...x, progress: pct } : x,
            ),
          );
        });
        onFilesChange(
          uploadingFiles.map((x) =>
            x.id === f.id
              ? { ...x, status: "done" as const, progress: 100 }
              : x,
          ),
        );
      } catch {
        onFilesChange(
          uploadingFiles.map((x) =>
            x.id === f.id
              ? { ...x, status: "error" as const, error: labels.uploadFailed }
              : x,
          ),
        );
      }
    }
    setUploading(false);
  }, [onUpload, uploading, files, onFilesChange, labels]);

  const handleRemove = useCallback(
    (id: string) => {
      onFilesChange(files.filter((f) => f.id !== id));
    },
    [files, onFilesChange],
  );

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Outside the role="button" dropzone and out of the a11y tree — a
          focusable input inside an interactive element is nested-interactive;
          the dropzone itself is the keyboard/AT entry point. */}
      <input
        ref={inputRef}
        id={autoId}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleInputChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        disabled={disabled}
      />
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-label={labels.dropzoneIdle}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={cn(
          "focus-visible:ring-brand flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors focus-visible:ring-2 focus-visible:outline-none",
          dragOver
            ? "border-brand bg-brand/5"
            : "border-border hover:bg-surface-hover",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <svg
          className="text-muted mb-2 size-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p className="text-fg text-sm">
          {dragOver ? labels.dropzoneActive : labels.dropzoneIdle}
        </p>
        {accept && (
          <p className="text-muted mt-1 text-xs">
            {labels.acceptedLabel}: {accept}
          </p>
        )}
      </div>

      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          {files.map((f) => (
            <div
              key={f.id}
              className="border-border bg-surface flex items-center gap-3 rounded-lg border p-3"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-fg truncate text-sm">
                    {f.file.name}
                  </span>
                  <span className="text-muted shrink-0 text-xs">
                    {humanSize(f.file.size)}
                  </span>
                </div>
                {(f.status === "uploading" || f.status === "pending") && (
                  <Progress value={f.progress} className="h-1.5" />
                )}
                {f.status === "error" && f.error && (
                  <p className="text-error text-xs">{f.error}</p>
                )}
                {f.status === "done" && (
                  <p className="text-success text-xs">{labels.uploaded}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemove(f.id)}
                className="text-muted hover:text-fg shrink-0 rounded-md p-1 transition-colors"
                aria-label={labels.remove!(f.file.name)}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {onUpload && files.some((f) => f.status === "pending") && (
        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading}
          className="bg-brand text-brand-fg hover:bg-brand/90 inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
        >
          {uploading
            ? labels.uploading
            : labels.uploadButton!(
                files.filter((f) => f.status === "pending").length,
              )}
        </button>
      )}
    </div>
  );
}
