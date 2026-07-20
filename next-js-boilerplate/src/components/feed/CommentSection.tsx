"use client";

import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import { useToast } from "@/components/ui/Toast";
import { ReactionInline } from "./ReactionButtons";
import { toISOString, formatDateByPreference } from "@/lib/date-time";
import { useDateDisplayCookie } from "@/hooks/useDateDisplayCookie";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { IconButton } from "@/components/ui/button/icon-button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { usePostActions } from "@/api/client/posts/actions";
import type {
  CommentSectionProps,
  Comment,
} from "@/types/feed/CommentSection-types";

async function handleEditComment(
  commentId: string,
  editingBody: string,
  setEditingId: Dispatch<SetStateAction<string | null>>,
  setEditingBody: Dispatch<SetStateAction<string>>,
  setLocalEdits: Dispatch<SetStateAction<Record<string, string>>>,
  onCommentAdded: (() => void) | undefined,
  updateComment: (commentId: string, body: string) => Promise<void>,
) {
  if (!editingBody.trim()) return;
  setLocalEdits((prev) => ({ ...prev, [commentId]: editingBody.trim() }));
  try {
    await updateComment(commentId, editingBody.trim());
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
}

export function CommentSection({
  postId,
  comments,
  currentUserId,
  onCommentAdded,
}: CommentSectionProps) {
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const [pendingComments, setPendingComments] = useState<Comment[]>([]);
  const [localEdits, setLocalEdits] = useState<Record<string, string>>({});
  const [localDeletes, setLocalDeletes] = useState<Set<string>>(new Set());
  const tempIdCounter = useRef(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState("");
  const dateDisplay = useDateDisplayCookie();
  const { createComment, updateComment, deleteComment } = usePostActions();

  const allComments = [
    ...comments
      .filter((c) => !localDeletes.has(c.id))
      .map((c) => (localEdits[c.id] ? { ...c, body: localEdits[c.id] } : c)),
    ...pendingComments,
  ];

  const topLevel = allComments.filter((c) => !c.parentId);
  const replies = (parentId: string) =>
    allComments.filter((c) => c.parentId === parentId);

  async function handleDeleteComment(
    commentId: string,
    setLocalDeletes: Dispatch<SetStateAction<Set<string>>>,
    onCommentAdded: (() => void) | undefined,
    deleteComment: (commentId: string) => Promise<void>,
  ) {
    setLocalDeletes((prev) => new Set(prev).add(commentId));
    try {
      await deleteComment(commentId);
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
  }

  async function handleSubmitComment(
    e: React.SyntheticEvent,
    body: string,
    setBody: Dispatch<SetStateAction<string>>,
    submitting: boolean,
    setSubmitting: Dispatch<SetStateAction<boolean>>,
    tempIdCounter: React.MutableRefObject<number>,
    setPendingComments: Dispatch<SetStateAction<Comment[]>>,
    replyTo: string | null,
    setReplyTo: Dispatch<SetStateAction<string | null>>,
    postId: string,
    currentUserId: string | null | undefined,
    onCommentAdded: (() => void) | undefined,
    toast: ReturnType<typeof useToast>["toast"],
  ) {
    e.preventDefault();
    if (!body.trim() || submitting) return;
    const trimmedBody = body.trim();
    setSubmitting(true);
    tempIdCounter.current++;

    const temp: Comment = {
      id: `opt-${tempIdCounter.current}`,
      body: trimmedBody,
      createdAt: toISOString(),
      author: { id: currentUserId ?? "", name: "You", email: "" },
      parentId: replyTo,
    };
    setPendingComments((prev) => [...prev, temp]);
    setBody("");
    const prevReplyTo = replyTo;
    setReplyTo(null);
    try {
      await createComment(postId, trimmedBody, replyTo);
      setPendingComments((prev) => prev.filter((c) => c.id !== temp.id));
      onCommentAdded?.();
    } catch {
      setPendingComments((prev) => prev.filter((c) => c.id !== temp.id));
      toast({ title: "Network error", variant: "destructive" });
      setBody(trimmedBody);
      setReplyTo(prevReplyTo);
    } finally {
      setSubmitting(false);
    }
  }

  const isOwn = (comment: { author: { id: string } }) =>
    currentUserId && comment.author.id === currentUserId;

  return (
    <div className="flex flex-col gap-2">
      <form
        onSubmit={(e) =>
          handleSubmitComment(
            e,
            body,
            setBody,
            submitting,
            setSubmitting,
            tempIdCounter,
            setPendingComments,
            replyTo,
            setReplyTo,
            postId,
            currentUserId,
            onCommentAdded,
            toast,
          )
        }
        className="flex gap-2"
      >
        <input
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={replyTo ? "Reply..." : "Write a comment..."}
          className="border-border bg-surface text-fg placeholder:text-muted focus:ring-brand/30 flex-1 rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!body.trim() || submitting}
          className="bg-brand rounded-lg px-4 py-2 text-xs font-medium text-brand-fg transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {replyTo ? "Reply" : "Send"}
        </button>
        {replyTo && (
          <button
            type="button"
            onClick={() => setReplyTo(null)}
            className="text-muted hover:text-fg text-xs underline transition-colors"
          >
            Cancel
          </button>
        )}
      </form>

      <div className="flex flex-col gap-1.5">
        {topLevel.length === 0 && (
          <p className="text-muted px-1 text-xs">No comments yet.</p>
        )}
        {topLevel.map((comment) => (
          <div key={comment.id} className="flex flex-col gap-1">
            <div className="border-border bg-surface hover:bg-surface-hover rounded-xl border px-3 py-2 transition-colors">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className="text-fg truncate text-xs leading-none font-medium">
                    {comment.author.name || comment.author.email}
                  </span>
                  <span className="text-muted shrink-0 text-[10px] leading-none">
                    {formatDateByPreference(comment.createdAt, dateDisplay)}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <ReactionInline
                    commentId={comment.id}
                    reactions={comment.reactions ?? []}
                    currentUserId={currentUserId}
                    onReactionChange={onCommentAdded}
                  />
                  {!isOwn(comment) && (
                    <button
                      onClick={() => setReplyTo(comment.id)}
                      className="text-muted hover:text-fg px-1 text-[10px] font-medium transition-colors"
                    >
                      Reply
                    </button>
                  )}
                  {isOwn(comment) && editingId !== comment.id && (
                    <>
                      <IconButton
                        icon={<IconPencil size={12} />}
                        label="Edit comment"
                        size="icon-xs"
                        onClick={() => {
                          setEditingId(comment.id);
                          setEditingBody(comment.body);
                        }}
                      />
                      <ConfirmDialog
                        title="Delete comment"
                        description="Are you sure you want to delete this comment?"
                        onConfirm={() =>
                          handleDeleteComment(
                            comment.id,
                            setLocalDeletes,
                            onCommentAdded,
                            deleteComment,
                          )
                        }
                      >
                        {(open) => (
                          <IconButton
                            icon={<IconTrash size={12} />}
                            label="Delete comment"
                            size="icon-xs"
                            onClick={open}
                          />
                        )}
                      </ConfirmDialog>
                    </>
                  )}
                </div>
              </div>
              {editingId === comment.id ? (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={editingBody}
                    onChange={(e) => setEditingBody(e.target.value)}
                    className="border-border bg-bg text-fg focus:ring-brand/30 flex-1 rounded-lg border px-3 py-1.5 text-sm focus:ring-2 focus:outline-none"
                    // Revealed by clicking "Edit" on this comment, not on initial page load.
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter")
                        handleEditComment(
                          comment.id,
                          editingBody,
                          setEditingId,
                          setEditingBody,
                          setLocalEdits,
                          onCommentAdded,
                          updateComment,
                        );
                      if (e.key === "Escape") setEditingId(null);
                    }}
                  />
                  <button
                    onClick={() =>
                      handleEditComment(
                        comment.id,
                        editingBody,
                        setEditingId,
                        setEditingBody,
                        setLocalEdits,
                        onCommentAdded,
                        updateComment,
                      )
                    }
                    className="bg-brand rounded-lg px-3 py-1.5 text-xs font-medium text-brand-fg"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-muted hover:text-fg text-xs underline transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <p className="text-muted mt-1 text-sm leading-relaxed">
                  {comment.body}
                </p>
              )}
            </div>

            {replies(comment.id).map((reply) => (
              <div key={reply.id} className="ml-4 flex flex-col gap-1">
                <div className="border-border bg-surface/50 hover:bg-surface-hover rounded-xl border px-3 py-2 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <span className="text-fg truncate text-xs leading-none font-medium">
                        {reply.author.name || reply.author.email}
                      </span>
                      <span className="text-muted shrink-0 text-[10px] leading-none">
                        {formatDateByPreference(reply.createdAt, dateDisplay)}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <ReactionInline
                        commentId={reply.id}
                        reactions={reply.reactions ?? []}
                        currentUserId={currentUserId}
                        onReactionChange={onCommentAdded}
                      />
                      {isOwn(reply) && editingId !== reply.id && (
                        <>
                          <IconButton
                            icon={<IconPencil size={12} />}
                            label="Edit reply"
                            size="icon-xs"
                            onClick={() => {
                              setEditingId(reply.id);
                              setEditingBody(reply.body);
                            }}
                          />
                          <ConfirmDialog
                            title="Delete reply"
                            description="Are you sure you want to delete this reply?"
                            onConfirm={() =>
                              handleDeleteComment(
                                reply.id,
                                setLocalDeletes,
                                onCommentAdded,
                                deleteComment,
                              )
                            }
                          >
                            {(open) => (
                              <IconButton
                                icon={<IconTrash size={12} />}
                                label="Delete reply"
                                size="icon-xs"
                                onClick={open}
                              />
                            )}
                          </ConfirmDialog>
                        </>
                      )}
                    </div>
                  </div>
                  {editingId === reply.id ? (
                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        value={editingBody}
                        onChange={(e) => setEditingBody(e.target.value)}
                        className="border-border bg-bg text-fg focus:ring-brand/30 flex-1 rounded-lg border px-3 py-1.5 text-sm focus:ring-2 focus:outline-none"
                        // Revealed by clicking "Edit" on this reply, not on initial page load.
                        // eslint-disable-next-line jsx-a11y/no-autofocus
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            handleEditComment(
                              reply.id,
                              editingBody,
                              setEditingId,
                              setEditingBody,
                              setLocalEdits,
                              onCommentAdded,
                              updateComment,
                            );
                          if (e.key === "Escape") setEditingId(null);
                        }}
                      />
                      <button
                        onClick={() =>
                          handleEditComment(
                            reply.id,
                            editingBody,
                            setEditingId,
                            setEditingBody,
                            setLocalEdits,
                            onCommentAdded,
                            updateComment,
                          )
                        }
                        className="bg-brand rounded-lg px-3 py-1.5 text-xs font-medium text-brand-fg"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-muted hover:text-fg text-xs underline transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <p className="text-muted mt-1 text-sm leading-relaxed">
                      {reply.body}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
