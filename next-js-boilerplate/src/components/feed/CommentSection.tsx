"use client";

import { useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ReactionInline } from "./ReactionButtons";
import { IconChevronRight, IconPencil, IconTrash } from "@tabler/icons-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface Comment {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; name: string; email: string };
  parentId?: string | null;
  reactions?: Array<{ id: string; type: string; userId: string }>;
  _count?: { replies: number };
}

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  currentUserId?: string | null;
  onCommentAdded?: () => void;
  maxTopLevel?: number;
  pageable?: boolean;
}

export function CommentSection({
  postId,
  comments,
  currentUserId,
  onCommentAdded,
  maxTopLevel = 5,
  pageable = false,
}: CommentSectionProps) {
  const params = useParams<{ lang: string }>();
  const lang = params?.lang ?? "en";
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingComments, setPendingComments] = useState<Comment[]>([]);
  const [localEdits, setLocalEdits] = useState<Record<string, string>>({});
  const [localDeletes, setLocalDeletes] = useState<Set<string>>(new Set());
  const tempIdCounter = useRef(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState("");
  const [visibleCount, setVisibleCount] = useState(maxTopLevel);

  const allComments = [
    ...comments
      .filter((c) => !localDeletes.has(c.id))
      .map((c) => (localEdits[c.id] ? { ...c, body: localEdits[c.id] } : c)),
    ...pendingComments,
  ];

  const topLevel = allComments.filter((c) => !c.parentId);
  const visibleTopLevel = topLevel.slice(0, visibleCount);
  const hasMore = topLevel.length > visibleCount;
  const replies = (parentId: string) =>
    allComments.filter((c) => c.parentId === parentId);

  const handleEdit = async (commentId: string) => {
    if (!editingBody.trim()) return;
    const oldBody = comments.find((c) => c.id === commentId)?.body;
    setLocalEdits((prev) => ({ ...prev, [commentId]: editingBody.trim() }));
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: editingBody.trim() }),
      });
      if (!res.ok) {
        setLocalEdits((prev) => {
          const next = { ...prev };
          delete next[commentId];
          return next;
        });
        return;
      }
      setEditingId(null);
      setEditingBody("");
      setLocalEdits((prev) => {
        const next = { ...prev };
        delete next[commentId];
        return next;
      });
      onCommentAdded?.();
    } catch {
      setLocalEdits((prev) => {
        const next = { ...prev };
        delete next[commentId];
        return next;
      });
    }
  };

  const handleDelete = async (commentId: string) => {
    setLocalDeletes((prev) => new Set(prev).add(commentId));
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setLocalDeletes((prev) => {
          const next = new Set(prev);
          next.delete(commentId);
          return next;
        });
        return;
      }
      setLocalDeletes((prev) => {
        const next = new Set(prev);
        next.delete(commentId);
        return next;
      });
      onCommentAdded?.();
    } catch {
      setLocalDeletes((prev) => {
        const next = new Set(prev);
        next.delete(commentId);
        return next;
      });
    }
  };

  const isOwn = (comment: { author: { id: string } }) =>
    currentUserId && comment.author.id === currentUserId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || submitting) return;
    const trimmedBody = body.trim();
    setSubmitting(true);
    setError(null);
    tempIdCounter.current++;

    const temp: Comment = {
      id: `opt-${tempIdCounter.current}`,
      body: trimmedBody,
      createdAt: new Date().toISOString(),
      author: { id: currentUserId ?? "", name: "You", email: "" },
      parentId: replyTo,
    };
    setPendingComments((prev) => [...prev, temp]);
    setBody("");
    const prevReplyTo = replyTo;
    setReplyTo(null);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          body: trimmedBody,
          ...(replyTo ? { parentId: replyTo } : {}),
        }),
      });
      if (!res.ok) {
        setPendingComments((prev) => prev.filter((c) => c.id !== temp.id));
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? `Failed (${res.status})`);
        setBody(trimmedBody);
        setReplyTo(prevReplyTo);
        return;
      }
      setPendingComments((prev) => prev.filter((c) => c.id !== temp.id));
      onCommentAdded?.();
    } catch {
      setPendingComments((prev) => prev.filter((c) => c.id !== temp.id));
      setError("Network error");
      setBody(trimmedBody);
      setReplyTo(prevReplyTo);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      {error && <p className="text-[9px] text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="flex gap-1">
        <input
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={replyTo ? "Reply..." : "Comment..."}
          className="border-border bg-surface flex-1 rounded-lg border px-1.5 py-0.5 text-[11px]"
        />
        <button
          type="submit"
          disabled={!body.trim() || submitting}
          className="bg-brand rounded-lg px-1.5 py-0.5 text-[9px] font-medium text-white disabled:opacity-40"
        >
          {replyTo ? "Reply" : "Send"}
        </button>
        {replyTo && (
          <button
            type="button"
            onClick={() => setReplyTo(null)}
            className="text-muted text-[9px] underline"
          >
            Cancel
          </button>
        )}
      </form>

      <div className="flex flex-col gap-1">
        {visibleTopLevel.length === 0 && (
          <p className="text-muted text-[9px]">No comments yet.</p>
        )}
        {visibleTopLevel.map((comment) => (
          <div key={comment.id} className="flex flex-col gap-0.5">
            <div className="border-border rounded-lg border px-2 py-1">
              <div className="flex items-center justify-between gap-1">
                <div className="flex min-w-0 items-center gap-1">
                  <span className="text-fg shrink-0 text-[10px] leading-none font-medium">
                    {comment.author.name || comment.author.email}
                  </span>
                  <span className="text-muted shrink-0 text-[8px] leading-none">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <ReactionInline
                    commentId={comment.id}
                    reactions={comment.reactions ?? []}
                    currentUserId={currentUserId}
                  />
                  {!isOwn(comment) && (
                    <button
                      onClick={() => setReplyTo(comment.id)}
                      className="text-muted hover:text-fg text-[8px] transition-colors"
                    >
                      Reply
                    </button>
                  )}
                  {isOwn(comment) && editingId !== comment.id && (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(comment.id);
                          setEditingBody(comment.body);
                        }}
                        className="text-muted hover:text-fg p-0.5"
                      >
                        <IconPencil size={10} stroke={1.5} />
                      </button>
                      <ConfirmDialog
                        title="Delete comment"
                        description="Are you sure you want to delete this comment?"
                        onConfirm={() => handleDelete(comment.id)}
                      >
                        {(open) => (
                          <button
                            onClick={open}
                            className="text-muted p-0.5 hover:text-red-500"
                          >
                            <IconTrash size={10} stroke={1.5} />
                          </button>
                        )}
                      </ConfirmDialog>
                    </>
                  )}
                </div>
              </div>
              {editingId === comment.id ? (
                <div className="mt-1 flex gap-1">
                  <input
                    type="text"
                    value={editingBody}
                    onChange={(e) => setEditingBody(e.target.value)}
                    className="border-border bg-surface text-fg flex-1 rounded border px-1.5 py-0.5 text-[11px]"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleEdit(comment.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                  />
                  <button
                    onClick={() => handleEdit(comment.id)}
                    className="bg-brand rounded px-1.5 py-0.5 text-[9px] font-medium text-white"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-muted text-[9px] underline"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <p className="text-muted mt-0.5 text-[11px] leading-snug">
                  {comment.body}
                </p>
              )}
            </div>

            {replies(comment.id).map((reply) => (
              <div key={reply.id} className="ml-2 flex flex-col gap-0.5">
                <div className="border-border rounded-lg border px-2 py-1">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex min-w-0 items-center gap-1">
                      <span className="text-fg shrink-0 text-[10px] leading-none font-medium">
                        {reply.author.name || reply.author.email}
                      </span>
                      <span className="text-muted shrink-0 text-[8px] leading-none">
                        {new Date(reply.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <ReactionInline
                        commentId={reply.id}
                        reactions={reply.reactions ?? []}
                        currentUserId={currentUserId}
                      />
                      {isOwn(reply) && editingId !== reply.id && (
                        <>
                          <button
                            onClick={() => {
                              setEditingId(reply.id);
                              setEditingBody(reply.body);
                            }}
                            className="text-muted hover:text-fg p-0.5"
                          >
                            <IconPencil size={10} stroke={1.5} />
                          </button>
                          <ConfirmDialog
                            title="Delete reply"
                            description="Are you sure you want to delete this reply?"
                            onConfirm={() => handleDelete(reply.id)}
                          >
                            {(open) => (
                              <button
                                onClick={open}
                                className="text-muted p-0.5 hover:text-red-500"
                              >
                                <IconTrash size={10} stroke={1.5} />
                              </button>
                            )}
                          </ConfirmDialog>
                        </>
                      )}
                    </div>
                  </div>
                  {editingId === reply.id ? (
                    <div className="mt-1 flex gap-1">
                      <input
                        type="text"
                        value={editingBody}
                        onChange={(e) => setEditingBody(e.target.value)}
                        className="border-border bg-surface text-fg flex-1 rounded border px-1.5 py-0.5 text-[11px]"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleEdit(reply.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                      />
                      <button
                        onClick={() => handleEdit(reply.id)}
                        className="bg-brand rounded px-1.5 py-0.5 text-[9px] font-medium text-white"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-muted text-[9px] underline"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <p className="text-muted mt-0.5 text-[11px] leading-snug">
                      {reply.body}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {hasMore &&
        (pageable ? (
          <button
            onClick={() => setVisibleCount((prev) => prev + maxTopLevel)}
            className="text-muted hover:text-fg mt-1 w-fit text-[10px] font-medium transition-colors"
          >
            Load more ({topLevel.length - visibleCount} remaining)
          </button>
        ) : (
          <Link
            href={`/v1/${lang}/posts/${postId}`}
            className="text-muted hover:text-fg mt-1 flex items-center gap-0.5 text-[10px] font-medium transition-colors"
          >
            See more
            <IconChevronRight size={12} stroke={1.5} />
          </Link>
        ))}
    </div>
  );
}
