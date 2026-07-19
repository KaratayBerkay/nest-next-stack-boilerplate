"use client";

import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { FileUpload } from "@/components/ui/FileUpload";
import { useToast } from "@/components/ui/toast/use-toast";
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
              "flex size-20 items-center justify-center overflow-hidden border-2 border-dashed border-border bg-surface",
              "rounded-full",
            )}
          >
            {current?.preview ? (
              // eslint-disable-next-line @next/next/no-img-element -- blob:// URL from file input, next/image doesn't support
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
          </div>
          <label className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-bg/60 text-xs font-medium text-fg opacity-0 transition-opacity hover:opacity-100">
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
                      title: "Invalid file type",
                      description: labels.invalidType!(file.name, "images"),
                      variant: "destructive",
                    });
                    e.target.value = "";
                    return;
                  }
                  const preview = URL.createObjectURL(file);
                  revokeRef.current.add(preview);
                  onChange([{ id: "avatar", file, progress: 0, status: "done", preview } as UploadFile]);
                }
              }}
            />
          </label>
        </div>
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
                "group relative overflow-hidden rounded-lg border border-border bg-surface",
                aspect === "video" ? "aspect-video" : "aspect-square",
              )}
            >
              {f.preview && (
                // eslint-disable-next-line @next/next/no-img-element -- blob:// URL from file input, next/image doesn't support
                <img
                  src={f.preview}
                  alt={f.file.name}
                  className="size-full object-cover"
                />
              )}
              <button
                type="button"
                onClick={() => handleRemove(f.id)}
                className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-bg/80 text-xs text-fg opacity-0 transition-opacity hover:bg-bg group-hover:opacity-100"
                aria-label={labels.remove!(f.file.name)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
              <div className="absolute right-1 bottom-1 left-1 truncate rounded bg-bg/80 px-1 py-0.5 text-xxs text-fg opacity-0 transition-opacity group-hover:opacity-100">
                {f.file.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
