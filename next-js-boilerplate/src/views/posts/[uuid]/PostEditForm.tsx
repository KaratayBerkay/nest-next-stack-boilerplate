"use client";

import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { Post } from "@/types/posts/Post-types";

interface PostEditFormProps {
  post: Post;
  editTitle: string;
  editContent: string;
  onEditTitleChange: (value: string) => void;
  onEditContentChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function PostEditForm({
  post,
  editTitle,
  editContent,
  onEditTitleChange,
  onEditContentChange,
  onSave,
  onCancel,
}: PostEditFormProps) {
  const t = useMessages("posts");

  return (
    <div className="flex flex-col gap-3">
      <input
        type="text"
        value={editTitle}
        onChange={(e) => onEditTitleChange(e.target.value)}
        className="border-border bg-bg text-fg focus:ring-brand/30 w-full rounded-lg border px-3 py-2 text-lg font-bold focus:ring-2 focus:outline-none"
      />
      <textarea
        value={editContent}
        onChange={(e) => onEditContentChange(e.target.value)}
        className="border-border bg-bg text-fg focus:ring-brand/30 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
        rows={5}
      />
      <div className="flex items-center gap-2">
        <button
          onClick={onSave}
          className="bg-brand text-brand-fg rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
        >
          {t.save}
        </button>
        <button
          onClick={onCancel}
          className="text-muted hover:text-fg text-sm underline transition-colors"
        >
          {t.cancel}
        </button>
      </div>
    </div>
  );
}
