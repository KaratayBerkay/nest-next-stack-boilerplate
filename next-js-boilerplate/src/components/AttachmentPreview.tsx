import { IconFileText } from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import type { AttachmentPreviewProps } from "@/types/components/AttachmentPreview-types";

function fileExtension(name: string | null | undefined): string {
  if (!name) return "";
  const parts = name.split(".");
  return parts.length > 1 ? (parts.pop() ?? "").toUpperCase() : "";
}

export function AttachmentPreview({
  url,
  type,
  name,
  className,
}: AttachmentPreviewProps) {
  const label = name || "Attachment";
  const isImage = type?.startsWith("image/");

  if (isImage) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        aria-label={label}
        className={cn(
          "inline-block max-h-48 w-auto max-w-[240px] overflow-hidden rounded-lg",
          className,
        )}
      >
        <img
          src={url}
          alt={label}
          loading="lazy"
          className="max-h-48 w-auto max-w-[240px] rounded-lg object-cover"
        />
      </a>
    );
  }

  const ext = fileExtension(name);

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={label}
      className={cn(
        "bg-surface-hover text-muted hover:bg-surface flex size-16 shrink-0 flex-col items-center justify-center gap-1 rounded-xl transition-colors",
        className,
      )}
    >
      <IconFileText size={24} />
      {ext && (
        <span className="max-w-[90%] truncate text-[9px] font-semibold tracking-wide">
          {ext}
        </span>
      )}
    </a>
  );
}
