"use client";

import { useEffect, useState } from "react";
import {
  IconFileText,
  IconExternalLink,
  IconLoader2,
} from "@tabler/icons-react";
import type { AttachmentCryptoMetadata } from "@/lib/crypto/attachments";

interface EncryptedAttachmentPreviewProps {
  url: string;
  cryptoMetadata: AttachmentCryptoMetadata;
  className?: string;
}

export function EncryptedAttachmentPreview({
  url,
  cryptoMetadata,
  className,
}: EncryptedAttachmentPreviewProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let revoked = false;
    let currentUrl: string | null = null;

    async function decrypt() {
      try {
        const { decryptAttachmentToObjectUrl } =
          await import("@/lib/crypto/attachments");
        const ou = await decryptAttachmentToObjectUrl(url, cryptoMetadata);
        if (!revoked) {
          currentUrl = ou;
          setObjectUrl(ou);
        } else {
          URL.revokeObjectURL(ou);
        }
      } catch {
        if (!revoked) setError(true);
      }
    }

    decrypt();

    return () => {
      revoked = true;
      if (currentUrl) URL.revokeObjectURL(currentUrl);
    };
  }, [url, cryptoMetadata]);

  const label = cryptoMetadata.originalName || "Attachment";
  const isImage = cryptoMetadata.originalType?.startsWith("image/");

  if (error) {
    return (
      <div className="bg-surface border-border text-muted flex w-fit items-center gap-2 rounded-lg border px-3 py-2 text-xs">
        <IconFileText size={18} className="shrink-0" />
        <span className="truncate">{label} (decrypt failed)</span>
      </div>
    );
  }

  if (!objectUrl) {
    return (
      <div className="bg-surface border-border text-muted flex w-fit items-center gap-2 rounded-lg border px-3 py-2 text-xs">
        <IconLoader2 size={18} className="shrink-0 animate-spin" />
        <span className="truncate">Decrypting {label}...</span>
      </div>
    );
  }

  if (isImage) {
    return (
      <a
        href={objectUrl}
        download={label}
        aria-label={label}
        className={className}
      >
        <img
          src={objectUrl}
          alt={label}
          loading="lazy"
          className="max-h-48 w-auto max-w-[240px] rounded-lg object-cover"
        />
      </a>
    );
  }

  return (
    <a
      href={objectUrl}
      download={label}
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
