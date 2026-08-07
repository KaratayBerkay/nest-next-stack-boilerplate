"use client";

import { useState } from "react";
import { IconFile, IconFileText, IconPhoto } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UPLOAD_SERVE_URL } from "@/constants/api/urls";
import type { AttachmentPreviewProps } from "@/types/components/AttachmentPreview-types";

const IMAGE_EXTENSIONS = new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "svg",
  "bmp",
  "ico",
  "avif",
  "tiff",
]);

const PDF_EXTENSIONS = new Set(["pdf"]);

function fileExtension(name: string | null | undefined): string {
  if (!name) return "";
  const parts = name.split(".");
  return parts.length > 1 ? (parts.pop() ?? "").toLowerCase() : "";
}

function isImageByExtension(name: string | null | undefined): boolean {
  return IMAGE_EXTENSIONS.has(fileExtension(name));
}

function isPdfByExtension(name: string | null | undefined): boolean {
  return PDF_EXTENSIONS.has(fileExtension(name));
}

function serveUrl(url: string): string {
  const pathname = new URL(url).pathname;
  const objectName = pathname.replace(/^\//, "");
  return `${UPLOAD_SERVE_URL}?objectName=${encodeURIComponent(objectName)}`;
}

function formatBytes(bytes: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AttachmentIcon({
  type,
  name,
}: {
  type: string | null | undefined;
  name: string | null | undefined;
}) {
  if (type?.startsWith("image/") || isImageByExtension(name))
    return <IconPhoto size={16} className="text-muted shrink-0" />;
  if (isPdfByExtension(name))
    return <IconFileText size={16} className="text-muted shrink-0" />;
  return <IconFile size={16} className="text-muted shrink-0" />;
}

export function AttachmentPreview({
  url,
  type,
  name,
  size,
  thumbnailUrl,
  className,
}: AttachmentPreviewProps) {
  const [open, setOpen] = useState(false);
  const [thumbFailed, setThumbFailed] = useState(false);
  const label = name || "Attachment";
  const href = serveUrl(url);
  const isImage = type?.startsWith("image/") || isImageByExtension(name);
  const isPdf = isPdfByExtension(name);
  const showThumb = !!thumbnailUrl && !thumbFailed;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "bg-surface border-border hover:bg-surface-hover flex items-center gap-2 rounded-lg border py-1.5 pr-2.5 text-left transition-colors",
          showThumb ? "pl-1.5" : "pl-2.5",
          className,
        )}
      >
        {thumbnailUrl && !thumbFailed ? (
          <img
            src={serveUrl(thumbnailUrl)}
            alt=""
            className="bg-surface-hover size-10 shrink-0 rounded-md object-cover"
            onError={() => setThumbFailed(true)}
          />
        ) : (
          <AttachmentIcon type={type} name={name} />
        )}
        <span className="text-fg max-w-[160px] truncate text-xs">{label}</span>
        {size ? (
          <span className="text-muted shrink-0 text-[10px]">
            {formatBytes(size)}
          </span>
        ) : null}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
          </DialogHeader>
          <DialogBody className="flex items-center justify-center overflow-auto">
            {isImage ? (
              <img
                src={href}
                alt={label}
                className="max-h-[70vh] rounded-lg object-contain"
              />
            ) : isPdf ? (
              <embed
                src={href}
                type="application/pdf"
                className="h-[70vh] w-full rounded-lg"
              />
            ) : (
              <div className="text-muted flex flex-col items-center gap-3 py-10">
                <IconFileText size={48} />
                <span className="text-sm">
                  Preview not available for this file type
                </span>
                <a
                  href={href}
                  download={label}
                  className="text-brand text-sm hover:underline"
                >
                  Download
                </a>
              </div>
            )}
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  );
}
