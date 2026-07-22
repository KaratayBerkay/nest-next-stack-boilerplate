"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import type { ImagePreviewSectionProps } from "@/types/share/ImagePreviewSection-types";

export function ImagePreviewSection({
  preview,
  uploading,
  uploadError,
  coverImageRef,
  fileRef,
  setFile,
  setPreview,
  setUploadError,
  t,
}: ImagePreviewSectionProps) {
  if (!preview) return null;

  function handleRemove() {
    setFile(null);
    setPreview(null);
    setUploadError(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleRetry() {
    setUploadError(false);
    coverImageRef.current = undefined;
  }

  return (
    <div className="relative mt-2 h-48 w-full">
      <Image
        src={preview}
        alt={t.preview}
        fill
        className={`rounded-lg object-cover ${uploading ? "opacity-50" : ""}`}
        unoptimized
      />
      {uploading && (
        <div className="bg-overlay/30 absolute inset-0 flex items-center justify-center rounded-lg">
          <div className="bg-overlay/60 flex items-center gap-2 rounded-full px-3 py-1.5 text-xs text-white">
            <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {t.uploading}
          </div>
        </div>
      )}
      {!uploading && (
        <button
          type="button"
          onClick={handleRemove}
          className="bg-overlay/50 absolute top-1 right-1 rounded-full p-1 text-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
      {uploadError && (
        <div className="bg-error/10 text-error mt-2 flex items-center gap-2 rounded-md px-3 py-2 text-xs">
          <span>{t.imageUploadFailed}</span>
          <Button type="button" variant="link" size="xs" onClick={handleRemove}>
            {t.remove}
          </Button>
          <Button type="button" variant="link" size="xs" onClick={handleRetry}>
            {t.retry}
          </Button>
        </div>
      )}
    </div>
  );
}
