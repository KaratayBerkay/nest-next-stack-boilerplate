"use client";

import { IconMessageCircle } from "@tabler/icons-react";
import { CommentSection } from "./CommentSection";
import type { PostActionsProps } from "@/types/feed/PostActions-types";

export function PostActions({
  isExpanded,
  postData,
  onToggle,
  currentUserId,
  onCommentAdded,
}: PostActionsProps) {
  return (
    <>
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          className="text-muted hover:text-fg flex items-center gap-1 text-[11px] transition-colors"
        >
          <IconMessageCircle size={14} stroke={1.5} />
          {postData._count?.comments ?? postData.comments?.length ?? 0}
        </button>
      </div>

      {isExpanded && (
        <div className="border-border max-h-[60vh] overflow-y-auto border-t pt-2">
          <CommentSection
            postId={postData.id}
            comments={postData.comments ?? []}
            currentUserId={currentUserId}
            onCommentAdded={onCommentAdded}
          />
        </div>
      )}
    </>
  );
}
