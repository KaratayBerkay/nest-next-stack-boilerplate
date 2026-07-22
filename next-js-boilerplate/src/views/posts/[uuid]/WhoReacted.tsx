import { Avatar } from "@/components/ui/Avatar";
import { initials } from "@/lib/initials";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { Post } from "@/types/posts/Post-types";

interface WhoReactedProps {
  post: Post;
}

export function WhoReacted({ post }: WhoReactedProps) {
  const t = useMessages("posts");

  if (!post.whoReacted || post.whoReacted.length === 0) {
    return null;
  }

  return (
    <div className="border-border rounded-xl border p-4">
      <h3 className="text-muted mb-3 text-xs font-semibold tracking-wide uppercase">
        {t.whoReacted}
      </h3>
      <div className="flex flex-col gap-2">
        {post.whoReacted.map((r) => (
          <div
            key={`${r.userId}-${r.type}`}
            className="flex items-center gap-2"
          >
            <Avatar
              fallback={initials(r.name ?? "?")}
              className="bg-brand text-brand-fg h-6 w-6 text-[9px]"
            />
            <span className="text-fg text-sm">{r.name ?? t.unknown}</span>
            <span className="text-sm">{r.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
