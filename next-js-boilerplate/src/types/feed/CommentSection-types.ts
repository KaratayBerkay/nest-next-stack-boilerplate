export interface Comment {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; name: string; email: string };
  parentId?: string | null;
  reactions?: Array<{ id: string; type: string; userId: string }>;
  _count?: { replies: number };
}

export interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  currentUserId?: string | null;
  onCommentAdded?: () => void;
}
