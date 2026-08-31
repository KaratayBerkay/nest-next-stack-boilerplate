"use client";

import { IconCornerUpLeft, IconX } from "@tabler/icons-react";
import { IconButton } from "@/components/ui/button/icon-button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { ReplyBannerProps } from "@/types/messages/ReplyBanner-types";

export function ReplyBanner({
  replyTarget,
  isReplyToMe,
  peerName,
  onCancel,
}: ReplyBannerProps) {
  const t = useMessages("messages");
  const senderLabel = isReplyToMe ? t.you : peerName;
  const preview = replyTarget.deletedAt
    ? t.deletedMessage
    : replyTarget.body
      ? replyTarget.body
      : replyTarget.hasAttachments
        ? t.attachmentPreview
        : t.decryptionFailed;

  return (
    <div className="border-border bg-surface/60 flex items-center gap-2 border-t px-5 pt-2.5">
      <IconCornerUpLeft
        size={16}
        stroke={1.75}
        className="text-brand shrink-0"
      />
      <div className="min-w-0 flex-1">
        <div className="text-brand text-xs font-medium">
          {t.replyingTo.replace("{name}", senderLabel)}
        </div>
        <div className="text-muted truncate text-xs">{preview}</div>
      </div>
      <IconButton
        icon={<IconX size={14} stroke={1.75} />}
        label={t.cancelReply}
        size="icon-xs"
        onClick={onCancel}
      />
    </div>
  );
}
