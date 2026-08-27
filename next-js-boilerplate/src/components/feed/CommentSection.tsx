"use client";

import {
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
  type SyntheticEvent,
} from "react";
import { useToast } from "@/components/ui/Toast";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { toISOString } from "@/lib/date-time";
import { useDateDisplayCookie } from "@/hooks/useDateDisplayCookie";
import { usePostActions } from "@/api/client/posts/actions";
import { CommentList } from "./CommentList";
import { CommentComposer } from "./CommentComposer";
import type {
  CommentSectionProps,
  Comment,
} from "@/types/feed/CommentSection-types";

type Toast = ReturnType<typeof useToast>["toast"];

async function handleSubmitComment(
  e: SyntheticEvent,
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
  toast: Toast,
  createComment: (
    postId: string,
    body: string,
    replyTo?: string | null,
  ) => Promise<unknown>,
  youLabel: string,
  createCommentFailedMessage: string,
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
    author: { id: currentUserId ?? "", name: youLabel, email: "" },
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
    toast({ title: createCommentFailedMessage, variant: "destructive" });
    setBody(trimmedBody);
    setReplyTo(prevReplyTo);
  } finally {
    setSubmitting(false);
  }
}

async function handleSaveEdit(
  comment: Comment,
  editingBody: string,
  setLocalEdits: Dispatch<SetStateAction<Record<string, string>>>,
  setEditingId: Dispatch<SetStateAction<string | null>>,
  onCommentAdded: (() => void) | undefined,
  updateComment: (
    commentId: string,
    body: string,
  ) => Promise<{ id: string; body: string }>,
  toast: Toast,
  failedMessage: string,
) {
  const trimmed = editingBody.trim();
  if (!trimmed) return;
  setLocalEdits((prev) => ({ ...prev, [comment.id]: trimmed }));
  setEditingId(null);
  try {
    const updated = await updateComment(comment.id, trimmed);
    if (updated?.body) {
      setLocalEdits((prev) => ({ ...prev, [comment.id]: updated.body }));
    }
    onCommentAdded?.();
  } catch {
    setLocalEdits((prev) => {
      const next = { ...prev };
      delete next[comment.id];
      return next;
    });
    toast({ title: failedMessage, variant: "destructive" });
  }
}

async function handleDeleteComment(
  comment: Comment,
  setLocalDeletes: Dispatch<SetStateAction<Set<string>>>,
  onCommentAdded: (() => void) | undefined,
  deleteComment: (commentId: string) => Promise<void>,
  toast: Toast,
  failedMessage: string,
) {
  setLocalDeletes((prev) => new Set(prev).add(comment.id));
  try {
    await deleteComment(comment.id);
    setLocalDeletes((prev) => {
      const next = new Set(prev);
      next.delete(comment.id);
      return next;
    });
    onCommentAdded?.();
  } catch {
    setLocalDeletes((prev) => {
      const next = new Set(prev);
      next.delete(comment.id);
      return next;
    });
    toast({ title: failedMessage, variant: "destructive" });
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
  const [pendingComments, setPendingComments] = useState<Comment[]>([]);
  const [localEdits, setLocalEdits] = useState<Record<string, string>>({});
  const [localDeletes, setLocalDeletes] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const tempIdCounter = useRef(0);
  const dateDisplay = useDateDisplayCookie();
  const { toast } = useToast();
  const t = useMessages("posts");
  const { createComment, updateComment, deleteComment } = usePostActions();

  const allComments = [
    ...comments
      .filter((c) => !localDeletes.has(c.id))
      .map((c) => (localEdits[c.id] ? { ...c, body: localEdits[c.id] } : c)),
    ...pendingComments,
  ];

  const isOwn = (comment: { author: { id: string } }) =>
    !!currentUserId && comment.author.id === currentUserId;

  const startEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditingBody(comment.body);
  };

  const cancelEdit = () => setEditingId(null);

  return (
    <div className="flex flex-col gap-2">
      <CommentComposer
        body={body}
        setBody={setBody}
        replyTo={replyTo}
        setReplyTo={setReplyTo}
        submitting={submitting}
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
            createComment,
            t.you,
            t.createCommentFailed,
          )
        }
      />

      <CommentList
        comments={allComments}
        editingId={editingId}
        editingBody={editingBody}
        isOwn={isOwn}
        onToggleReply={setReplyTo}
        onEditingBodyChange={setEditingBody}
        onStartEdit={startEdit}
        onSaveEdit={(comment) =>
          handleSaveEdit(
            comment,
            editingBody,
            setLocalEdits,
            setEditingId,
            onCommentAdded,
            updateComment,
            toast,
            t.editCommentFailed,
          )
        }
        onCancelEdit={cancelEdit}
        onDelete={(comment) =>
          handleDeleteComment(
            comment,
            setLocalDeletes,
            onCommentAdded,
            deleteComment,
            toast,
            t.deleteCommentFailed,
          )
        }
        currentUserId={currentUserId}
        onCommentAdded={onCommentAdded}
        dateDisplay={dateDisplay}
      />
    </div>
  );
}
