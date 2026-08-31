"use client";

import { IconCopy, IconExternalLink, IconLinkOff } from "@tabler/icons-react";
import { IconButton } from "@/components/ui/button/icon-button";
import { useToast } from "@/components/ui/Toast";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { ChatLinkCardProps } from "@/types/components/ChatLinkCard-types";

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

/** Card rendered under a chat bubble for each URL in the message. A URL
 *  that passed the click policy opens in a new tab; a rejected one (http,
 *  localhost, IP, port, …) renders inert with an explanation — but every
 *  card carries a copy action, so the recipient always has a deliberate
 *  way to use the raw URL. */
export function ChatLinkCard({ url, clickable }: ChatLinkCardProps) {
  const t = useMessages("messages");
  const { toast } = useToast();

  const copy = () => {
    navigator.clipboard
      .writeText(url)
      .then(() => toast({ title: t.chatLinkCopied }))
      .catch(() =>
        toast({ title: t.chatLinkCopyFailed, variant: "destructive" }),
      );
  };

  const body = (
    <>
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-md ${
          clickable ? "bg-brand/10 text-brand" : "bg-warning/10 text-warning"
        }`}
      >
        {clickable ? (
          <IconExternalLink size={16} aria-hidden />
        ) : (
          <IconLinkOff size={16} aria-hidden />
        )}
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="text-fg block truncate text-xs font-medium">
          {hostnameOf(url)}
        </span>
        <span className="text-muted block truncate text-[11px]">{url}</span>
        <span
          className={`block text-[10px] ${clickable ? "text-muted" : "text-warning"}`}
        >
          {clickable ? t.openLinkHint : t.linkBlocked}
        </span>
      </span>
    </>
  );

  return (
    <div className="bg-surface border-border flex w-72 max-w-full min-w-0 items-center gap-2 rounded-lg border p-2 shadow-xs">
      {clickable ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-visible:ring-brand flex min-w-0 flex-1 items-center gap-2 rounded-md transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:outline-none"
        >
          {body}
        </a>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-2">{body}</div>
      )}
      <IconButton
        icon={<IconCopy size={14} />}
        label={t.copyLinkAction}
        size="icon-xs"
        onClick={copy}
      />
    </div>
  );
}
