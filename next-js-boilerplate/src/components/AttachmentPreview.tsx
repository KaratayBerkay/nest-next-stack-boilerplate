import { IconFileText, IconExternalLink } from "@tabler/icons-react";
import type { AttachmentPreviewProps } from "@/types/components/AttachmentPreview-types";

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
        className={className}
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

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className={`bg-surface border-border text-fg hover:bg-surface-hover flex w-fit items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${className ?? ""}`}
    >
      <IconFileText size={18} className="text-muted shrink-0" />
      <span className="max-w-[180px] truncate text-xs font-medium">
        {label}
      </span>
      <IconExternalLink size={14} className="text-muted shrink-0" />
    </a>
  );
}
