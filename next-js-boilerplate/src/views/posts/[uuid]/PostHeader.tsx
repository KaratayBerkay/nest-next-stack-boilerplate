"use client";

import { IconPencil, IconTrash } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { ReactionInline } from "@/components/feed/ReactionButtons";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { IconButton } from "@/components/ui/button/icon-button";
import { formatDateByPreference } from "@/lib/date-time";
import { useDateDisplayCookie } from "@/hooks/useDateDisplayCookie";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { PageInfoButton } from "@/components/ui/page-info";
import { postsPageInfo } from "@/constants/page-info";
import type { Post } from "@/types/posts/Post-types";

interface PostHeaderProps {
  post: Post;
  uuid: string;
  editing: boolean;
  currentUserId?: string;
  showPageInfo?: boolean;
  onStartEdit: () => void;
  onDelete: () => void;
}

export function PostHeader({
  post,
  uuid,
  editing,
  currentUserId,
  showPageInfo,
  onStartEdit,
  onDelete,
}: PostHeaderProps) {
  const t = useMessages("posts");
  const queryClient = useQueryClient();
  const dateDisplay = useDateDisplayCookie();

  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-2.5">
        <div className="bg-brand text-brand-fg flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold shadow-sm">
          {(post.author.name || post.author.email).charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-fg text-sm font-semibold">
            {post.author.name || post.author.email}
          </p>
          <p className="text-muted text-[11px]">
            {formatDateByPreference(post.createdAt, dateDisplay)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-0.5">
        <ReactionInline
          postId={post.id}
          reactions={post.reactions ?? []}
          currentUserId={currentUserId}
          onReactionChange={() =>
            queryClient.invalidateQueries({ queryKey: ["posts", uuid] })
          }
        />
        {currentUserId && post.author.id === currentUserId && !editing && (
          <>
            <IconButton
              icon={<IconPencil size={14} stroke={1.5} />}
              label="Edit post"
              onClick={onStartEdit}
            />
            <ConfirmDialog
              title={t.deletePost}
              description={t.deletePostConfirm}
              onConfirm={onDelete}
            >
              {(open) => (
                <IconButton
                  icon={<IconTrash size={14} stroke={1.5} />}
                  label="Delete post"
                  onClick={open}
                  className="hover:text-red-500"
                />
              )}
            </ConfirmDialog>
          </>
        )}
        {showPageInfo && <PageInfoButton content={postsPageInfo} />}
      </div>
    </div>
  );
}
