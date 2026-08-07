import type { DateDisplayFormat } from "@/constants/date-display";
import type { Comment } from "@/types/feed/CommentSection-types";

export interface CommentListProps {
  comments: Comment[];
  editingId: string | null;
  editingBody: string;
  isOwn: (comment: { author: { id: string } }) => boolean;
  onToggleReply: (commentId: string) => void;
  onEditingBodyChange: (value: string) => void;
  onStartEdit: (comment: Comment) => void;
  onSaveEdit: (comment: Comment) => void;
  onCancelEdit: () => void;
  onDelete: (comment: Comment) => void;
  currentUserId: string | null | undefined;
  onCommentAdded: (() => void) | undefined;
  dateDisplay: DateDisplayFormat;
}
