import type { Post } from "@/types/posts/Post-types";

export interface PostHeaderProps {
  post: Post;
  uuid: string;
  editing: boolean;
  currentUserId?: string;
  showPageInfo?: boolean;
  onStartEdit: () => void;
  onDelete: () => void;
}
