"use client";

import type { KeyboardEvent } from "react";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { ReactionInline } from "./ReactionButtons";
import { formatDateByPreference } from "@/lib/date-time";
import { IconButton } from "@/components/ui/button/icon-button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { CommentCardProps } from "@/types/feed/CommentCard-types";

function handleEditKeyDown(
  e: KeyboardEvent<HTMLInputElement>,
  onSaveEdit: () => void,
  onCancelEdit: () => void,
) {
  if (e.key === "Enter") onSaveEdit();
  if (e.key === "Escape") onCancelEdit();
}

export function CommentCard({
  comment,
  isOwn,
  isReply,
  editing,
  editingBody,
  onEditingBodyChange,
  onToggleReply,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  currentUserId,
  onCommentAdded,
  dateDisplay,
}: CommentCardProps) {
  const t = useMessages("posts");
  return (
    <div
      className={`border-border ${
        isReply ? "bg-surface/50" : "bg-surface"
      } hover:bg-surface-hover rounded-xl border px-3 py-2 transition-colors`}
    >
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
          {!isReply && !isOwn && onToggleReply && (
            <button
              type="button"
              onClick={onToggleReply}
              className="text-muted hover:text-fg px-1 text-[10px] font-medium transition-colors"
            >
              {t.reply}
            </button>
          )}
          {isOwn && !editing && (
            <>
              <IconButton
                icon={<IconPencil size={12} />}
                label={isReply ? t.editReply : t.editComment}
                size="icon-xs"
                onClick={onStartEdit}
              />
              <ConfirmDialog
                title={isReply ? t.deleteReply : t.deleteComment}
                description={t.deleteCommentConfirm}
                onConfirm={onDelete}
              >
                {(open) => (
                  <IconButton
                    icon={<IconTrash size={12} />}
                    label={isReply ? t.deleteReply : t.deleteComment}
                    size="icon-xs"
                    onClick={open}
                  />
                )}
              </ConfirmDialog>
            </>
          )}
        </div>
      </div>
      {editing ? (
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={editingBody}
            onChange={(e) => onEditingBodyChange(e.target.value)}
            className="border-border bg-bg text-fg focus:ring-brand/30 flex-1 rounded-lg border px-3 py-1.5 text-sm focus:ring-2 focus:outline-none"
            // Revealed by clicking "Edit" on this comment, not on initial page load.
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            onKeyDown={(e) => handleEditKeyDown(e, onSaveEdit, onCancelEdit)}
          />
          <button
            type="button"
            onClick={onSaveEdit}
            className="bg-brand text-brand-fg rounded-lg px-3 py-1.5 text-xs font-medium"
          >
            {t.save}
          </button>
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-muted hover:text-fg text-xs underline transition-colors"
          >
            {t.cancel}
          </button>
        </div>
      ) : (
        <p className="text-muted mt-1 text-sm leading-relaxed">
          {comment.body}
        </p>
      )}
    </div>
  );
}
