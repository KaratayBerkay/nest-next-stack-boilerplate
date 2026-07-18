"use client";

import { apiFetch } from "@/lib/api-client";
import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  IconArrowLeft,
  IconMessageCircle,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import { useAuth } from "@/hooks/useAuth";
import { useYSwipeGesture } from "@/hooks/useYSwipeGesture";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useRealtime } from "@/lib/realtime/RealtimeProvider";
import { imageUrl } from "@/lib/image";
import { ReactionInline } from "@/components/feed/ReactionButtons";
import { CommentSection } from "@/components/feed/CommentSection";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatDateByPreference } from "@/lib/date-time";
import { useDateDisplayCookie } from "@/hooks/useDateDisplayCookie";
import { Avatar } from "@/components/ui/Avatar";
import { initials } from "@/lib/initials";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useMarkPostNotificationsRead } from "@/lib/notifications/useMarkPostNotificationsRead";
import { POSTS_PREFIX } from "@/constants/api/urls";
import { PUT, DELETE } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";
import { PageInfoButton } from "@/components/ui/page-info";
import { postsPageInfo } from "@/constants/page-info";
import { PostDetailFallback } from "@/fallbacks";
import type { PostDetailBaseViewProps } from "@/types/posts/PostDetailBaseView-types";

interface Post {
  id: string;
  title: string;
  content: string;
  coverImage?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  author: { id: string; name: string; email: string };
  comments?: Array<{
    id: string;
    body: string;
    createdAt: string;
    author: { id: string; name: string; email: string };
    reactions?: Array<{ id: string; type: string; userId: string }>;
    parentId?: string | null;
    _count?: { replies: number };
  }>;
  reactions?: Array<{ id: string; type: string; userId: string }>;
  reactionBreakdown?: Array<{ type: string; count: number }>;
  whoReacted?: Array<{ userId: string; name?: string; type: string }>;
  _count?: { comments: number; reactions: number };
}

function PostDetailContent({
  showPageInfo = false,
  showReactionBreakdown = false,
  showWhoReacted = false,
  initialPostData,
}: PostDetailBaseViewProps) {
  const t = useMessages("posts");
  const params = useParams<{ lang: string; uuid: string }>();
  const uuid = params?.uuid ?? "";
  const router = useRouter();
  const { user } = useAuth();
  const realtime = useRealtime();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const swipeRef = useYSwipeGesture<HTMLDivElement>();
  const dateDisplay = useDateDisplayCookie();

  useEffect(() => {
    if (!uuid) return;
    const topic = `post:${uuid}`;
    realtime?.watch(topic);
    return () => realtime?.unwatch(topic);
  }, [realtime, uuid]);

  useMarkPostNotificationsRead(uuid);

  const { data: post } = useSuspenseQuery<Post>({
    queryKey: ["posts", uuid],
    queryFn: async () => {
      const res = await apiFetch(POSTS_PREFIX + uuid);
      if (!res.ok) throw new Error(t.postNotFound);
      const data = await res.json();
      if (!data.post) throw new Error(t.postNotFound);
      return data.post;
    },
    staleTime: 30_000,
    initialData: initialPostData as Post | undefined,
  });

  return (
    <div
      ref={swipeRef}
      className="flex max-h-full min-h-0 w-full flex-col gap-4 overflow-y-auto py-6 max-md:px-1"
    >
      <button
        onClick={() => router.back()}
        className="text-muted hover:text-fg flex items-center gap-1 text-xs transition-colors"
      >
        <IconArrowLeft size={16} stroke={1.5} />
        {t.back}
      </button>

      <div className="surface flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="bg-brand flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm">
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
              currentUserId={user?.id}
              onReactionChange={() =>
                queryClient.invalidateQueries({ queryKey: ["posts", uuid] })
              }
            />
            {user && post.author.id === user.id && !editing && (
              <>
                <button
                  onClick={() => {
                    setEditTitle(post.title);
                    setEditContent(post.content);
                    setEditing(true);
                  }}
                  className="text-muted hover:bg-surface-hover hover:text-fg rounded-lg p-1.5 transition-colors"
                  aria-label="Edit post"
                >
                  <IconPencil size={14} stroke={1.5} />
                </button>
                <ConfirmDialog
                  title={t.deletePost}
                  description={t.deletePostConfirm}
                  onConfirm={async () => {
                    const res = await apiFetch(POSTS_PREFIX + post.id, {
                      method: DELETE,
                    });
                    if (res.ok) router.push(`/v1/${params?.lang ?? "en"}/feed`);
                  }}
                >
                  {(open) => (
                    <button
                      onClick={open}
                      className="text-muted hover:bg-surface-hover rounded-lg p-1.5 transition-colors hover:text-red-500"
                      aria-label="Delete post"
                    >
                      <IconTrash size={14} stroke={1.5} />
                    </button>
                  )}
                </ConfirmDialog>
              </>
            )}
            {showPageInfo && <PageInfoButton content={postsPageInfo} />}
          </div>
        </div>

        {editing ? (
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="border-border bg-bg text-fg focus:ring-brand/30 w-full rounded-lg border px-3 py-2 text-lg font-bold focus:ring-2 focus:outline-none"
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="border-border bg-bg text-fg focus:ring-brand/30 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
              rows={5}
            />
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  if (!editTitle.trim() || !editContent.trim()) return;
                  const res = await apiFetch(POSTS_PREFIX + post.id, {
                    method: PUT,
                    headers: JSON_CONTENT_TYPE_HEADER,
                    body: JSON.stringify({
                      title: editTitle.trim(),
                      content: editContent.trim(),
                    }),
                  });
                  if (res.ok) {
                    setEditing(false);
                    queryClient.invalidateQueries({
                      queryKey: ["posts", uuid],
                    });
                  }
                }}
                className="bg-brand rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                {t.save}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="text-muted hover:text-fg text-sm underline transition-colors"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        ) : (
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
            <h1 className="text-fg text-xl leading-tight font-bold">
              {post.title}
            </h1>
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
        )}
      </div>

      {showReactionBreakdown &&
        post.reactionBreakdown &&
        post.reactionBreakdown.length > 0 && (
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
                  <span className="text-muted text-xs font-medium">
                    {r.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      {showWhoReacted && post.whoReacted && post.whoReacted.length > 0 && (
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
                  className="bg-brand h-6 w-6 text-[9px] text-white"
                />
                <span className="text-fg text-sm">{r.name ?? t.unknown}</span>
                <span className="text-sm">{r.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <CommentSection
        postId={post.id}
        comments={post.comments ?? []}
        currentUserId={user?.id}
        onCommentAdded={() =>
          queryClient.invalidateQueries({ queryKey: ["posts", uuid] })
        }
      />
    </div>
  );
}

export function PostDetailBaseView(props: PostDetailBaseViewProps) {
  return (
    <Suspense fallback={<PostDetailFallback />}>
      <ErrorBoundary>
        <PostDetailContent {...props} />
      </ErrorBoundary>
    </Suspense>
  );
}
