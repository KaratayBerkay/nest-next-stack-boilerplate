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

/**
 * Maps a stored attachment URL to the authenticated serve endpoint. Exported
 * for tests. Returns null when `url` isn't a parseable URL: attachments that
 * arrived over the WebSocket used to skip DTO validation entirely, so one
 * crafted `url` from a peer threw here and took the whole conversation
 * render down with it (CROSS-046). The gateway validates now; this is the
 * client-side belt to that brace, and it also covers legacy rows.
 */
export function serveUrl(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  // Stored attachment URLs are always the object store's http(s) URLs —
  // anything else (javascript:, data:, …) has no object name to serve.
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
  const objectName = parsed.pathname.replace(/^\//, "");
  if (!objectName) return null;
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
    return <IconPhoto size={20} className="text-muted shrink-0" />;
  if (isPdfByExtension(name))
    return <IconFileText size={20} className="text-muted shrink-0" />;
  return <IconFile size={20} className="text-muted shrink-0" />;
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
  const thumbHref = thumbnailUrl ? serveUrl(thumbnailUrl) : null;
  const isImage = type?.startsWith("image/") || isImageByExtension(name);
  const isPdf = isPdfByExtension(name);

  // Nothing to open: render the same tile as an inert chip rather than a
  // button that leads to a broken viewer (or, before the guard, a crash).
  if (!href) {
    return (
      <span
        data-testid="attachment-unavailable"
        className={cn(
          "bg-surface border-border text-muted flex items-center gap-2 rounded-lg border py-1.5 pr-2.5 pl-1.5 text-left",
          className,
        )}
      >
        <span className="bg-surface-hover flex size-10 shrink-0 items-center justify-center rounded-md">
          <AttachmentIcon type={type} name={name} />
        </span>
        <span className="max-w-[160px] truncate text-xs">{label}</span>
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "bg-surface border-border hover:bg-surface-hover flex items-center gap-2 rounded-lg border py-1.5 pr-2.5 pl-1.5 text-left transition-colors",
          className,
        )}
      >
        {thumbHref && !thumbFailed ? (
          <img
            src={thumbHref}
            alt=""
            className="bg-surface-hover size-10 shrink-0 rounded-md object-cover"
            onError={() => setThumbFailed(true)}
          />
        ) : (
          // No thumbnail (unsupported type like .docx/.drawio, or generation
          // failed): a bare icon reads as an empty/broken slot next to real
          // thumbnails in a list. Same-sized tile keeps the row's leading
          // visual consistent either way.
          <div className="bg-surface-hover flex size-10 shrink-0 items-center justify-center rounded-md">
            <AttachmentIcon type={type} name={name} />
          </div>
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
              <iframe
                src={href}
                title={label}
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
