"use client";

import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { FileUpload, humanSize } from "@/components/ui/FileUpload";
import { useToast } from "@/components/ui/toast/use-toast";
import { Spinner } from "@/components/ui/Spinner";
import type { ImageUploadProps } from "@/types/ui/ImageUpload-types";
import type { UploadFile, FileUploadLabels } from "@/types/ui/FileUpload-types";

const DEFAULT_LABELS: FileUploadLabels = {
  invalidType: (file: string, accepted: string) =>
    `Only ${accepted} can be uploaded — got ${file}`,
  changePhoto: "Change",
  removePhoto: "Remove photo",
  remove: (file: string) => `Remove ${file}`,
};

export function ImageUpload({
  value,
  onChange,
  multiple,
  maxFiles,
  maxSizeBytes,
  avatar,
  aspect = "square",
  className,
  labels: labelsProp,
}: ImageUploadProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const { toast } = useToast();
  const revokeRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const current = revokeRef.current;
    return () => {
      current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const handleFilesChange = useCallback(
    (files: UploadFile[]) => {
      const withPreviews = files.map((f) => {
        if (f.preview) return f;
        const url = URL.createObjectURL(f.file);
        revokeRef.current.add(url);
        return { ...f, preview: url };
      });
      onChange(withPreviews);
    },
    [onChange],
  );

  const handleRemove = useCallback(
    (id: string) => {
      const file = value.find((f) => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
        revokeRef.current.delete(file.preview);
      }
      onChange(value.filter((f) => f.id !== id));
    },
    [value, onChange],
  );

  if (avatar) {
    const current = value[0];
    return (
      <div className={cn("flex flex-col items-center gap-3", className)}>
        <div className="relative">
          <div
            className={cn(
              "border-border bg-surface flex size-20 items-center justify-center overflow-hidden border-2 border-dashed",
              "rounded-full",
            )}
          >
            {current?.preview ? (
              <img
                src={current.preview}
                alt="Avatar"
                className="size-full object-cover"
              />
            ) : (
              <svg
                className="text-muted size-8"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
            {current?.status === "uploading" && (
              <div
                className="bg-bg/60 absolute inset-0 flex items-center justify-center rounded-full"
                role="status"
                aria-label={labels.uploading ?? "Uploading"}
              >
                <Spinner size="sm" />
              </div>
            )}
          </div>
          <label className="bg-bg/60 text-fg absolute inset-0 flex cursor-pointer items-center justify-center rounded-full text-xs font-medium opacity-0 transition-opacity focus-within:opacity-100 hover:opacity-100">
            <span>{labels.changePhoto}</span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (!file.type.startsWith("image/")) {
                    toast({
                      title: labels.invalidTypeTitle ?? "Invalid file type",
                      description: labels.invalidType!(file.name, "images"),
                      variant: "destructive",
                    });
                    e.target.value = "";
                    return;
                  }
                  const preview = URL.createObjectURL(file);
                  revokeRef.current.add(preview);
                  // "pending", not "done" — this is only a local preview, no
                  // upload has happened yet. Consumers (e.g.
                  // AvatarUploadSection) watch for a newly-added "pending"
                  // file to know when to actually call their upload action;
                  // marking it "done" here meant that upload was never
                  // triggered at all, so a real-mode profile save persisted
                  // this ephemeral blob: URL as the user's avatarUrl instead
                  // of the uploaded file's server URL.
                  onChange([
                    {
                      id: "avatar",
                      file,
                      progress: 0,
                      status: "pending",
                      preview,
                    } as UploadFile,
                  ]);
                }
              }}
            />
          </label>
        </div>
        {!current && (
          <p className="text-muted text-xxs text-center">
            {labels.acceptedTypesText?.("image/*") ?? "Images"}
            {maxSizeBytes &&
              ` · ${labels.maxSizeLabel?.(humanSize(maxSizeBytes)) ?? `max ${humanSize(maxSizeBytes)}`}`}
          </p>
        )}
        {current?.status === "error" && (
          <p className="text-error text-xxs text-center">
            {current.error || labels.uploadFailed || "Upload failed"}
          </p>
        )}
        {current && (
          <button
            type="button"
            onClick={() => handleRemove(current.id)}
            className="text-muted hover:text-fg text-xs transition-colors"
          >
            {labels.removePhoto}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <FileUpload
        multiple={multiple}
        accept="image/*"
        maxSizeBytes={maxSizeBytes}
        maxFiles={maxFiles}
        files={value}
        onFilesChange={handleFilesChange}
        labels={labelsProp}
        hideFileList
      />
      {value.length > 0 && (
        <div
          className={cn(
            "grid gap-3",
            multiple ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1",
          )}
        >
          {value.map((f) => (
            <div
              key={f.id}
              className={cn(
                "group border-border bg-surface relative overflow-hidden rounded-lg border",
                aspect === "video" ? "aspect-video" : "aspect-square",
              )}
            >
              {f.preview && (
                <img
                  src={f.preview}
                  alt={f.file.name}
                  className="size-full object-cover"
                />
              )}
              <button
                type="button"
                onClick={() => handleRemove(f.id)}
                className="bg-bg/80 text-fg hover:bg-bg absolute top-1 right-1 flex size-6 items-center justify-center rounded-full text-xs opacity-0 transition-opacity group-hover:opacity-100"
                aria-label={labels.remove!(f.file.name)}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
              <div className="bg-bg/80 text-xxs text-fg absolute right-1 bottom-1 left-1 truncate rounded px-1 py-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                {f.file.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
