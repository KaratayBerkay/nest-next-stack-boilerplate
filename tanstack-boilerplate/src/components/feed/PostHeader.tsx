"use client";

import { useAuth } from "@/hooks/useAuth";
import { useParams } from "next/navigation";
import Link from "next/link";
import { IconEye, IconPencil, IconTrash } from "@tabler/icons-react";
import { IconButton } from "@/components/ui/button/icon-button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ReactionInline } from "./ReactionButtons";
import { formatDateByPreference } from "@/lib/date-time";
import { useDateDisplayCookie } from "@/hooks/useDateDisplayCookie";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PostHeaderProps } from "@/types/feed/PostHeader-types";

export function PostHeader({
  postData,
  isOwn,
  editing,
  onRefresh,
  onEditStart,
  onDeleteConfirm,
}: PostHeaderProps) {
  const { user } = useAuth();
  const t = useMessages("posts");
  const params = useParams<{ lang: string }>();
  const dateDisplay = useDateDisplayCookie();

  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-1.5">
        <div className="bg-brand text-brand-fg flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold">
          {(postData.author.name || postData.author.email)
            .charAt(0)
            .toUpperCase()}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-fg text-xs leading-none font-medium">
            {postData.author.name || postData.author.email}
          </span>
          <span className="text-muted text-[10px] leading-none">
            {formatDateByPreference(postData.createdAt, dateDisplay)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <ReactionInline
          postId={postData.id}
          reactions={postData.reactions ?? []}
          currentUserId={user?.id}
          onReactionChange={onRefresh}
        />
        <Link
          href={`/v1/${params?.lang ?? "en"}/posts/${postData.id}`}
          aria-label={t.viewPost}
          className="text-muted hover:text-fg p-0.5"
        >
          <IconEye size={12} stroke={1.5} />
        </Link>
        {isOwn && !editing && (
          <>
            <IconButton
              icon={<IconPencil size={12} />}
              label={t.editPost}
              size="icon-xs"
              onClick={onEditStart}
            />
            <ConfirmDialog
              title={t.deletePost}
              description={t.deletePostConfirm}
              onConfirm={onDeleteConfirm}
            >
              {(open) => (
                <IconButton
                  icon={<IconTrash size={12} />}
                  label={t.deletePost}
                  size="icon-xs"
                  onClick={open}
                />
              )}
            </ConfirmDialog>
          </>
        )}
      </div>
    </div>
  );
}
