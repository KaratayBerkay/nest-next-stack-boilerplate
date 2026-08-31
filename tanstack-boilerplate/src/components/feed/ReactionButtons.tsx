"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { IconMoodSmile } from "@tabler/icons-react";
import { usePostActions } from "@/api/client/posts/actions";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  usePopover,
} from "@/components/ui/popover";
import { cn } from "@/lib/cn";
import type { Dispatch, SetStateAction } from "react";
import type { ReactionButtonProps } from "@/types/feed/ReactionButton-types";

const REACTION_TYPES = ["LIKE", "LOVE", "LAUGH", "WOW"] as const;

export const EMOJIS: Record<string, string> = {
  LIKE: "👍",
  LOVE: "❤️",
  LAUGH: "😂",
  WOW: "😮",
};

async function handleReactionInline(
  type: string,
  submitting: boolean,
  setSubmitting: Dispatch<SetStateAction<boolean>>,
  postId: string | undefined,
  commentId: string | undefined,
  onReactionChange: (() => void) | undefined,
  toast: ReturnType<typeof useToast>["toast"],
  toggleReaction: (params: {
    type: string;
    postId?: string;
    commentId?: string;
  }) => Promise<void>,
  reactFailedMessage: string,
) {
  if (submitting) return;
  setSubmitting(true);
  try {
    await toggleReaction({
      type,
      ...(postId ? { postId } : {}),
      ...(commentId ? { commentId } : {}),
    });
    onReactionChange?.();
  } catch {
    toast({ title: reactFailedMessage, variant: "destructive" });
  } finally {
    setSubmitting(false);
  }
}

function ReactionPicker({
  postId,
  commentId,
  reactions,
  currentUserId,
  onReactionChange,
}: ReactionButtonProps) {
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const t = useMessages("posts");
  const { toggleReaction } = usePostActions();
  const { close } = usePopover();

  return (
    <div className="flex gap-0.5">
      {REACTION_TYPES.map((type) => {
        const count = reactions.filter((r) => r.type === type).length;
        const active = reactions.some(
          (r) => r.type === type && r.userId === currentUserId,
        );
        return (
          <button
            key={type}
            onClick={async () => {
              await handleReactionInline(
                type,
                submitting,
                setSubmitting,
                postId,
                commentId,
                onReactionChange,
                toast,
                toggleReaction,
                t.reactFailed,
              );
              close();
            }}
            disabled={submitting}
            className={cn(
              "flex items-center gap-0.5 rounded-md px-1.5 py-1 text-[11px] transition-colors",
              active
                ? "bg-surface-hover text-fg"
                : "text-muted hover:bg-surface-hover",
            )}
          >
            <span className="text-sm">{EMOJIS[type]}</span>
            {count > 0 && <span>{count}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function ReactionInline({
  postId,
  commentId,
  reactions,
  currentUserId,
  onReactionChange,
}: ReactionButtonProps) {
  const t = useMessages("posts");
  const total = reactions.length;
  const userReacted = reactions.some((r) => r.userId === currentUserId);

  return (
    <Popover>
      <PopoverTrigger
        aria-label={t.reactToPost}
        className={cn(
          "gap-1 rounded-lg px-1.5 py-1 text-[11px] font-normal transition-colors",
          userReacted ? "text-brand" : "text-muted hover:text-brand",
        )}
      >
        <IconMoodSmile size={16} stroke={1.5} />
        {total > 0 && <span>{total}</span>}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-1">
        <ReactionPicker
          postId={postId}
          commentId={commentId}
          reactions={reactions}
          currentUserId={currentUserId}
          onReactionChange={onReactionChange}
        />
      </PopoverContent>
    </Popover>
  );
}
