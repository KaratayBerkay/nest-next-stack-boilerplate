"use client";

import type { Post } from "@/types/feed/PostCard-types";
import { imageUrl } from "@/lib/image";

interface PostContentProps {
  postData: Post;
  editing: boolean;
  editTitle: string;
  editContent: string;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
}

export function PostContent({
  postData,
  editing,
  editTitle,
  editContent,
  onTitleChange,
  onContentChange,
}: PostContentProps) {
  return (
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
        {editing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            className="border-border bg-surface text-fg w-full rounded border px-2 py-1 text-sm font-semibold"
          />
        ) : (
          <h3 className="text-fg text-sm leading-tight font-semibold">
            {postData.title}
          </h3>
        )}

        {editing ? (
          <textarea
            value={editContent}
            onChange={(e) => onContentChange(e.target.value)}
            className="border-border bg-surface text-fg w-full rounded border px-2 py-1 text-xs"
            rows={3}
          />
        ) : (
          <p className="text-muted text-xs leading-relaxed break-words whitespace-pre-wrap">
            {postData.content.length > 200
              ? postData.content.slice(0, 200) + "..."
              : postData.content}
          </p>
        )}
      </div>
    </div>
  );
}
