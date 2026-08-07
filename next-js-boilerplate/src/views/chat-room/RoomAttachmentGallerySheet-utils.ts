import { isSameDay, isToday } from "@/lib/date-time";
import type { RoomAttachment } from "@/api/server/messages/room-attachments";
import type { RoomAttachmentDayGroup } from "@/types/chat-room/RoomAttachmentGallerySheet-types";

/**
 * Buckets attachments into day groups. Input is already newest-first with no
 * gaps re-sorted in between days (see roomAttachmentsQueryOptions), so a
 * single adjacent-merge pass is equivalent to a true group-by and avoids
 * re-scanning the whole list per item.
 */
export function groupRoomAttachmentsByDay(
  attachments: RoomAttachment[],
): RoomAttachmentDayGroup[] {
  const groups: RoomAttachmentDayGroup[] = [];
  for (const att of attachments) {
    const last = groups[groups.length - 1];
    if (last && isSameDay(att.createdAt, last.createdAt)) {
      last.attachments.push(att);
      continue;
    }
    groups.push({
      key: att.createdAt,
      isToday: isToday(att.createdAt),
      createdAt: att.createdAt,
      attachments: [att],
    });
  }
  return groups;
}
