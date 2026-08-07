import { isSameDay, isToday } from "@/lib/date-time";
import type { ConversationAttachment } from "@/api/server/messages/conversation-attachments";
import type { AttachmentDayGroup } from "@/types/messages/AttachmentGallerySheet-types";

/**
 * Buckets attachments into day groups. Input is already newest-first with no
 * gaps re-sorted in between days (see conversationAttachmentsQueryOptions),
 * so a single adjacent-merge pass is equivalent to a true group-by and
 * avoids re-scanning the whole list per item.
 */
export function groupAttachmentsByDay(
  attachments: ConversationAttachment[],
): AttachmentDayGroup[] {
  const groups: AttachmentDayGroup[] = [];
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
