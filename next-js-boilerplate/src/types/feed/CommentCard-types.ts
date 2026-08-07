import type { DateDisplayFormat } from "@/constants/date-display";
import type { Comment } from "@/types/feed/CommentSection-types";

export interface CommentCardProps {
  comment: Comment;
  isOwn: boolean;
  isReply: boolean;
  editing: boolean;
  editingBody: string;
  onEditingBodyChange: (value: string) => void;
  onToggleReply: (() => void) | null;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  currentUserId: string | null | undefined;
  onCommentAdded: (() => void) | undefined;
  dateDisplay: DateDisplayFormat;
}
