"use client";

import Image from "next/image";
import { imageUrl } from "@/lib/image";
import type { PostContentProps } from "@/types/feed/PostContent-types";

// Array.from splits by Unicode code point — plain .slice/.length count UTF-16 units and can split a surrogate pair (emoji) mid-character.
export function truncate(text: string, max: number): string {
  const chars = Array.from(text);
  return chars.length > max ? chars.slice(0, max).join("") + "..." : text;
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
        <div className="relative mt-0.5 h-16 w-16 shrink-0 overflow-hidden rounded-lg">
          <Image
            src={imageUrl(postData.imageUrl, "badge") ?? ""}
            alt=""
            fill
            sizes="64px"
            className="object-cover"
          />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {editing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            minLength={3}
            maxLength={200}
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
            {truncate(postData.content, 200)}
          </p>
        )}
      </div>
    </div>
  );
}
