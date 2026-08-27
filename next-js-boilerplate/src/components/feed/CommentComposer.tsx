"use client";

import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { CommentComposerProps } from "@/types/feed/CommentComposer-types";

export function CommentComposer({
  body,
  setBody,
  replyTo,
  setReplyTo,
  submitting,
  onSubmit,
}: CommentComposerProps) {
  const t = useMessages("posts");
  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <input
        type="text"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={replyTo ? t.replyPlaceholder : t.writeCommentPlaceholder}
        className="border-border bg-surface text-fg placeholder:text-muted focus:ring-brand/30 flex-1 rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
      />
      <button
        type="submit"
        disabled={!body.trim() || submitting}
        className="bg-brand text-brand-fg rounded-lg px-4 py-2 text-xs font-medium transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {replyTo ? t.reply : t.send}
      </button>
      {replyTo && (
        <button
          type="button"
          onClick={() => setReplyTo(null)}
          className="text-muted hover:text-fg text-xs underline transition-colors"
        >
          {t.cancel}
        </button>
      )}
    </form>
  );
}
