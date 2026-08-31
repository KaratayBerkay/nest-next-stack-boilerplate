import type { Post } from "@/types/feed/PostCard-types";

export interface PostActionsProps {
  isExpanded: boolean;
  postData: Post;
  onToggle: () => void;
  currentUserId?: string;
  onCommentAdded: () => void;
}
