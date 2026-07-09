"use client";

import { apiFetch } from "@/lib/api-client";
import { useRef, useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { IconMoodSmile } from "@tabler/icons-react";
import { REACTIONS_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";
import type { Dispatch, SetStateAction } from "react";
import type { ReactionButtonProps } from "@/types/feed/ReactionButton-types";

const REACTION_TYPES = ["LIKE", "LOVE", "LAUGH", "WOW"] as const;

const EMOJIS: Record<string, string> = {
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
) {
  if (submitting) return;
  setSubmitting(true);
  try {
    await apiFetch(REACTIONS_URL, {
      method: POST,
      headers: JSON_CONTENT_TYPE_HEADER,
      body: JSON.stringify({
        type,
        ...(postId ? { postId } : {}),
        ...(commentId ? { commentId } : {}),
      }),
    });
    onReactionChange?.();
  } catch {
    toast({ title: "Failed to react", variant: "destructive" });
  } finally {
    setSubmitting(false);
  }
}

export function ReactionInline({
  postId,
  commentId,
  reactions,
  currentUserId,
  onReactionChange,
}: ReactionButtonProps) {
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const total = reactions.length;
  const userReacted = reactions.some((r) => r.userId === currentUserId);

  return (
    <div className="group relative">
      <button
        disabled={submitting}
        className={`flex items-center gap-1 rounded-lg px-1.5 py-1 text-[11px] transition-colors ${
          userReacted ? "text-brand" : "text-muted hover:text-brand"
        }`}
      >
        <IconMoodSmile size={16} stroke={1.5} />
        {total > 0 && <span>{total}</span>}
      </button>

      <div className="invisible absolute top-full right-0 z-50 mt-1 flex -translate-x-1/2 scale-90 gap-0.5 rounded-xl border bg-[#1a1a2e] px-2 py-1.5 opacity-0 shadow-lg transition-all group-hover:visible group-hover:translate-x-0 group-hover:scale-100 group-hover:opacity-100">
        {REACTION_TYPES.map((type) => {
          const count = reactions.filter((r) => r.type === type).length;
          const active = reactions.some(
            (r) => r.type === type && r.userId === currentUserId,
          );
          return (
            <button
              key={type}
              onClick={() => handleReactionInline(type, submitting, setSubmitting, postId, commentId, onReactionChange, toast)}
              disabled={submitting}
              className={`flex items-center gap-0.5 rounded-md px-1.5 py-1 text-[11px] transition-colors ${
                active
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/5"
              }`}
            >
              <span className="text-sm">{EMOJIS[type]}</span>
              {count > 0 && <span>{count}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

async function handleReactionRow(
  type: string,
  submitting: boolean,
  setSubmitting: Dispatch<SetStateAction<boolean>>,
  commentId: string | undefined,
  onReactionChange: (() => void) | undefined,
  toast: ReturnType<typeof useToast>["toast"],
) {
  if (submitting) return;
  setSubmitting(true);
  try {
    const res = await apiFetch(REACTIONS_URL, {
      method: POST,
      headers: JSON_CONTENT_TYPE_HEADER,
      body: JSON.stringify({ type, ...(commentId ? { commentId } : {}) }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast({ title: data.error ?? `Failed (${res.status})`, variant: "destructive" });
      return;
    }
    onReactionChange?.();
  } catch {
    toast({ title: "Network error", variant: "destructive" });
  } finally {
    setSubmitting(false);
  }
}

function ReactionRow({
  commentId,
  reactions,
  currentUserId,
  onReactionChange,
}: ReactionButtonProps) {
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  return (
    <div className="flex items-center gap-1">
      {REACTION_TYPES.map((type) => {
        const count = reactions.filter((r) => r.type === type).length;
        const active = reactions.some(
          (r) => r.type === type && r.userId === currentUserId,
        );
        return (
          <button
            key={type}
            onClick={() => handleReactionRow(type, submitting, setSubmitting, commentId, onReactionChange, toast)}
            disabled={submitting}
            className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] transition-colors ${
              active
                ? "bg-brand/10 text-brand"
                : "text-muted hover:bg-surface-hover"
            }`}
          >
            <span>{EMOJIS[type]}</span>
            {count > 0 && <span>{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
