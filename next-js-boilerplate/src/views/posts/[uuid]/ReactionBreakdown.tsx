import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { Post } from "@/types/posts/Post-types";

interface ReactionBreakdownProps {
  post: Post;
}

export function ReactionBreakdown({ post }: ReactionBreakdownProps) {
  const t = useMessages("posts");

  if (!post.reactionBreakdown || post.reactionBreakdown.length === 0) {
    return null;
  }

  return (
    <div className="border-border rounded-xl border p-4">
      <h3 className="text-muted mb-3 text-xs font-semibold tracking-wide uppercase">
        {t.reactionBreakdown}
      </h3>
      <div className="flex flex-wrap gap-2">
        {post.reactionBreakdown.map((r) => (
          <div
            key={r.type}
            className="bg-surface flex items-center gap-1 rounded-full px-3 py-1"
          >
            <span className="text-sm">{r.type}</span>
            <span className="text-muted text-xs font-medium">{r.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
