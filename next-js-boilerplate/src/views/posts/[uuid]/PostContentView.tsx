import Image from "next/image";
import { IconMessageCircle } from "@tabler/icons-react";
import { imageUrl } from "@/lib/image";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { Post } from "@/types/posts/Post-types";

interface PostContentViewProps {
  post: Post;
}

export function PostContentView({ post }: PostContentViewProps) {
  const t = useMessages("posts");

  return (
    <div className="flex flex-col gap-3">
      {post.imageUrl && (
        <div className="relative max-h-96 w-full overflow-hidden rounded-xl shadow-sm">
          <Image
            src={imageUrl(post.imageUrl, "full") ?? ""}
            alt=""
            fill
            priority
            sizes="(max-width: 768px) 100vw, 720px"
            className="max-h-96 object-cover"
          />
        </div>
      )}
      <h1 className="text-fg text-xl leading-tight font-bold">{post.title}</h1>
      <p className="text-muted text-sm leading-relaxed break-words whitespace-pre-wrap">
        {post.content}
      </p>
      <div className="border-border text-muted flex items-center gap-1.5 border-t pt-3 text-xs">
        <IconMessageCircle size={14} stroke={1.5} />
        {t.comments.replace(
          "{count}",
          String(post._count?.comments ?? post.comments?.length ?? 0),
        )}
      </div>
    </div>
  );
}
