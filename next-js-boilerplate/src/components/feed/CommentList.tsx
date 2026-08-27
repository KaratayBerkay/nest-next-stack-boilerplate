"use client";

import { CommentCard } from "./CommentCard";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { Comment } from "@/types/feed/CommentSection-types";
import type { CommentListProps } from "@/types/feed/CommentList-types";

export function CommentList({
  comments,
  editingId,
  editingBody,
  isOwn,
  onToggleReply,
  onEditingBodyChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  currentUserId,
  onCommentAdded,
  dateDisplay,
}: CommentListProps) {
  const t = useMessages("posts");
  const topLevel = comments.filter((c) => !c.parentId);
  const replies = (parentId: string) =>
    comments.filter((c) => c.parentId === parentId);

  const renderCard = (comment: Comment, isReply: boolean) => (
    <CommentCard
      comment={comment}
      isOwn={isOwn(comment)}
      isReply={isReply}
      editing={editingId === comment.id}
      editingBody={editingBody}
      onEditingBodyChange={onEditingBodyChange}
      onToggleReply={isReply ? null : () => onToggleReply(comment.id)}
      onStartEdit={() => onStartEdit(comment)}
      onSaveEdit={() => onSaveEdit(comment)}
      onCancelEdit={onCancelEdit}
      onDelete={() => onDelete(comment)}
      currentUserId={currentUserId}
      onCommentAdded={onCommentAdded}
      dateDisplay={dateDisplay}
    />
  );

  return (
    <div className="flex flex-col gap-1.5">
      {topLevel.length === 0 && (
        <p className="text-muted px-1 text-xs">{t.noCommentsYet}</p>
      )}
      {topLevel.map((comment) => (
        <div key={comment.id} className="flex flex-col gap-1">
          {renderCard(comment, false)}
          {replies(comment.id).map((reply) => (
            <div key={reply.id} className="ml-4 flex flex-col gap-1">
              {renderCard(reply, true)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
