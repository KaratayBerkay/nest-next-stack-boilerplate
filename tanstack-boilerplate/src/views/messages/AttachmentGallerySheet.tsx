"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  AttachmentGalleryPanel,
  useAttachmentGalleryFilters,
} from "@/components/AttachmentGalleryPanel";
import { conversationAttachmentsQueryOptions } from "@/api/client/messages/query";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { AttachmentGallerySheetProps } from "@/types/messages/AttachmentGallerySheet-types";

/** DM-conversation adapter over the shared AttachmentGalleryPanel — owns the
 *  conversation-attachments query; all rendering lives in the panel. */
export function AttachmentGallerySheet({
  open,
  onOpenChange,
  peerId,
}: AttachmentGallerySheetProps) {
  const t = useMessages("messages");
  const filters = useAttachmentGalleryFilters();

  const query = useInfiniteQuery({
    ...conversationAttachmentsQueryOptions(peerId, filters.query),
    enabled: open && !!peerId,
  });

  return (
    <AttachmentGalleryPanel
      open={open}
      onOpenChange={onOpenChange}
      labels={t}
      filters={filters}
      query={query}
    />
  );
}
