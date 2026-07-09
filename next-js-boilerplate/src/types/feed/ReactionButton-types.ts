interface Reaction {
  id: string;
  type: string;
  userId: string;
}

export interface ReactionButtonProps {
  postId?: string;
  commentId?: string;
  reactions: Reaction[];
  currentUserId?: string | null;
  onReactionChange?: () => void;
}
