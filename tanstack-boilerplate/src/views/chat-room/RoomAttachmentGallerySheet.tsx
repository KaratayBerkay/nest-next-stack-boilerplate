"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  AttachmentGalleryPanel,
  useAttachmentGalleryFilters,
} from "@/components/AttachmentGalleryPanel";
import { roomAttachmentsQueryOptions } from "@/api/client/messages/query";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { RoomAttachmentGallerySheetProps } from "@/types/chat-room/RoomAttachmentGallerySheet-types";

/** Chat-room adapter over the shared AttachmentGalleryPanel — owns the
 *  room-attachments query; all rendering lives in the panel. */
export function RoomAttachmentGallerySheet({
  open,
  onOpenChange,
  room,
}: RoomAttachmentGallerySheetProps) {
  const t = useMessages("chat-room");
  const filters = useAttachmentGalleryFilters();

  const query = useInfiniteQuery({
    ...roomAttachmentsQueryOptions(room, filters.query),
    enabled: open && !!room,
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
