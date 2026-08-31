import type { Post } from "@/types/posts/Post-types";

export interface PostEditFormProps {
  post: Post;
  editTitle: string;
  editContent: string;
  onEditTitleChange: (value: string) => void;
  onEditContentChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}
