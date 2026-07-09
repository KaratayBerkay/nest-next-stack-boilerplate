export interface Post {
  id: string;
  title: string;
  content: string;
  coverImage?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  author: { id: string; name: string; email: string };
  comments?: Array<{
    id: string;
    body: string;
    createdAt: string;
    author: { id: string; name: string; email: string };
    reactions?: Array<{ id: string; type: string; userId: string }>;
    parentId?: string | null;
    _count?: { replies: number };
  }>;
  reactions?: Array<{ id: string; type: string; userId: string }>;
  _count?: { comments: number; reactions: number };
}

export interface PostCardProps {
  post: Post;
  isExpanded?: boolean;
  onToggle?: () => void;
  onDelete?: (id: string) => void;
}
