import type { Post } from "@/types/feed/PostCard-types";

export interface PostContentProps {
  postData: Post;
  editing: boolean;
  editTitle: string;
  editContent: string;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
}
