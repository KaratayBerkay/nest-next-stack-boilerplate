"use client";

import { apiFetch } from "@/lib/api-client";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePostSocket } from "@/hooks/usePostSocket";
import { imageUrl } from "@/lib/image";
import { ReactionInline } from "./ReactionButtons";
import { CommentSection } from "./CommentSection";
import {
  IconEye,
  IconMessageCircle,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Post {
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

interface PostCardProps {
  post: Post;
  isExpanded?: boolean;
  onToggle?: () => void;
  onDelete?: (id: string) => void;
}

export function PostCard({
  post,
  isExpanded = false,
  onToggle,
  onDelete,
}: PostCardProps) {
  const { user } = useAuth();
  const params = useParams<{ lang: string }>();
  const [postData, setPostData] = useState(post);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const isOwn = user && postData.author.id === user.id;

  const refreshPost = async () => {
    try {
      setError(null);
      const res = await apiFetch(`/api/posts/${post.id}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? `Failed to load post (${res.status})`);
        return;
      }
      const data = await res.json();
      if (data.post) {
        setPostData(data.post);
      } else {
        setError("Post not found");
      }
    } catch {
      setError("Network error loading post");
    }
  };

  const handleToggle = () => {
    const willExpand = !isExpanded;
    onToggle?.();
    if (willExpand) refreshPost();
  };

  const handleEdit = async () => {
    if (!editTitle.trim() || !editContent.trim()) return;
    try {
      const res = await apiFetch(`/api/posts/${postData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          content: editContent.trim(),
        }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.post) {
        setPostData(data.post);
        setEditing(false);
      }
    } catch {
      // silent
    }
  };

  usePostSocket(isExpanded ? postData.id : null, refreshPost);

  const handleDelete = async () => {
    try {
      const res = await apiFetch(`/api/posts/${postData.id}`, {
        method: "DELETE",
      });
      if (!res.ok) return;
      onDelete?.(postData.id);
    } catch {
      // silent
    }
  };

  return (
    <div
      id={`post-${postData.id}`}
      className="border-border surface flex flex-col gap-2 rounded-xl border p-3"
    >
      {/* Author row + reactions */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <div className="bg-brand flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold text-white">
            {(postData.author.name || postData.author.email)
              .charAt(0)
              .toUpperCase()}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-fg text-xs leading-none font-medium">
              {postData.author.name || postData.author.email}
            </span>
            <span className="text-muted text-[10px] leading-none">
              {new Date(postData.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <ReactionInline
            postId={postData.id}
            reactions={postData.reactions ?? []}
            currentUserId={user?.id}
            onReactionChange={refreshPost}
          />
          <Link
            href={`/v1/${params?.lang ?? "en"}/posts/${postData.id}`}
            className="text-muted hover:text-fg p-0.5"
          >
            <IconEye size={12} stroke={1.5} />
          </Link>
          {isOwn && !editing && (
            <>
              <button
                onClick={() => {
                  setEditTitle(postData.title);
                  setEditContent(postData.content);
                  setEditing(true);
                }}
                className="text-muted hover:text-fg p-0.5"
              >
                <IconPencil size={12} stroke={1.5} />
              </button>
              <ConfirmDialog
                title="Delete post"
                description="Are you sure you want to delete this post?"
                onConfirm={handleDelete}
              >
                {(open) => (
                  <button
                    onClick={open}
                    className="text-muted p-0.5 hover:text-red-500"
                  >
                    <IconTrash size={12} stroke={1.5} />
                  </button>
                )}
              </ConfirmDialog>
            </>
          )}
        </div>
      </div>

      {/* Image + body side by side */}
      <div className="flex gap-3">
        {postData.imageUrl && (
          <img
            src={imageUrl(postData.imageUrl, "badge")}
            alt=""
            className="mt-0.5 h-16 w-16 shrink-0 rounded-lg object-cover"
            loading="lazy"
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {/* Title */}
          {editing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="border-border bg-surface text-fg w-full rounded border px-2 py-1 text-sm font-semibold"
            />
          ) : (
            <h3 className="text-fg text-sm leading-tight font-semibold">
              {postData.title}
            </h3>
          )}

          {/* Content */}
          {editing ? (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="border-border bg-surface text-fg w-full rounded border px-2 py-1 text-xs"
              rows={3}
            />
          ) : (
            <p className="text-muted text-xs leading-relaxed break-words whitespace-pre-wrap">
              {postData.content.length > 200 && !isExpanded
                ? postData.content.slice(0, 200) + "..."
                : postData.content}
            </p>
          )}
        </div>
      </div>

      {/* Edit actions */}
      {editing && (
        <div className="flex items-center gap-2">
          <button
            onClick={handleEdit}
            className="bg-brand rounded-lg px-3 py-1 text-xs font-medium text-white"
          >
            Save
          </button>
          <button
            onClick={() => setEditing(false)}
            className="text-muted text-xs underline"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Error */}
      {error && <p className="text-[10px] text-red-500">{error}</p>}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleToggle}
          className="text-muted hover:text-fg flex items-center gap-1 text-[11px] transition-colors"
        >
          <IconMessageCircle size={14} stroke={1.5} />
          {postData._count?.comments ?? postData.comments?.length ?? 0}
        </button>
      </div>

      {/* Comments */}
      {isExpanded && (
        <div className="border-border max-h-[60vh] overflow-y-auto border-t pt-2">
          <CommentSection
            postId={postData.id}
            comments={postData.comments ?? []}
            currentUserId={user?.id}
            onCommentAdded={refreshPost}
          />
        </div>
      )}
    </div>
  );
}
