import type { Post } from "@/types/feed/PostCard-types";

export interface PostHeaderProps {
  postData: Post;
  isOwn: boolean;
  editing: boolean;
  onRefresh: () => void;
  onEditStart: () => void;
  onDeleteConfirm: () => void;
}
