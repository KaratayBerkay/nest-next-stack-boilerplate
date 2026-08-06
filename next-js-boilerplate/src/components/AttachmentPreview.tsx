import { IconFileText } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
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

function fileExtension(name: string | null | undefined): string {
  if (!name) return "";
  const parts = name.split(".");
  return parts.length > 1 ? (parts.pop() ?? "").toLowerCase() : "";
}

function isImageByExtension(name: string | null | undefined): boolean {
  return IMAGE_EXTENSIONS.has(fileExtension(name));
}

function serveUrl(url: string): string {
  const segments = url.split("/");
  const objectName = segments[segments.length - 1].split("?")[0];
  return `/api/upload/serve/${objectName}`;
}

function formatBytes(bytes: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentPreview({
  url,
  type,
  name,
  size,
  className,
}: AttachmentPreviewProps) {
  const label = name || "Attachment";
  const isImage = type?.startsWith("image/") || isImageByExtension(name);
  const href = serveUrl(url);
  const ext = fileExtension(name);

  if (isImage) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        aria-label={label}
        title={label}
        className={cn(
          "bg-surface border-border hover:bg-surface-hover flex items-center gap-3 rounded-lg border p-2 transition-colors",
          className,
        )}
      >
        <img
          src={href}
          alt={label}
          loading="lazy"
          className="bg-surface-hover size-12 shrink-0 rounded-md object-cover"
        />
        <div className="min-w-0 flex-1">
          <span className="text-fg block truncate text-sm">{label}</span>
          {size ? (
            <span className="text-muted text-xs">{formatBytes(size)}</span>
          ) : null}
        </div>
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={label}
      className={cn(
        "bg-surface border-border hover:bg-surface-hover flex items-center gap-3 rounded-lg border p-2 transition-colors",
        className,
      )}
    >
      <div className="bg-surface-hover text-muted flex size-12 shrink-0 items-center justify-center rounded-md">
        <IconFileText size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-fg block truncate text-sm">{label}</span>
        <div className="flex items-center gap-2">
          {ext ? (
            <span className="text-muted text-[10px] font-semibold uppercase">
              {ext}
            </span>
          ) : null}
          {size ? (
            <span className="text-muted text-xs">{formatBytes(size)}</span>
          ) : null}
        </div>
      </div>
    </a>
  );
}
