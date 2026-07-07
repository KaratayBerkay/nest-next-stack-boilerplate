"use client";

import { apiFetch } from "@/lib/api-client";
import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Avatar } from "@/components/ui/Avatar";
import { initials } from "@/lib/initials";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useMarkPostNotificationsRead } from "@/lib/notifications/useMarkPostNotificationsRead";

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

function PostDetailContent() {
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
      const res = await apiFetch(`/api/posts/${uuid}`);
      if (!res.ok) throw new Error(t.postNotFound);
      const data = await res.json();
      if (!data.post) throw new Error(t.postNotFound);
      return data.post;
    },
    staleTime: 30_000,
  });

  return (
    <div ref={swipeRef} className="mx-auto flex w-full max-w-2xl min-h-0 max-h-full flex-col gap-4 overflow-y-auto py-6 max-md:px-1">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-xs text-muted transition-colors hover:text-fg"
      >
        <IconArrowLeft size={16} stroke={1.5} />
        {t.back}
      </button>

      <div className="surface flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-xs font-bold text-white shadow-sm">
              {(post.author.name || post.author.email).charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-fg">
                {post.author.name || post.author.email}
              </p>
              <p className="text-[11px] text-muted">
                {new Date(post.createdAt).toLocaleDateString()}
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
                  className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-hover hover:text-fg"
                >
                  <IconPencil size={14} stroke={1.5} />
                </button>
                <ConfirmDialog
                  title={t.deletePost}
                  description={t.deletePostConfirm}
                  onConfirm={async () => {
                    const res = await apiFetch(`/api/posts/${post.id}`, {
                      method: "DELETE",
                    });
                    if (res.ok)
                      router.push(`/v1/${params?.lang ?? "en"}/feed`);
                  }}
                >
                  {(open) => (
                    <button
                      onClick={open}
                      className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-hover hover:text-red-500"
                    >
                      <IconTrash size={14} stroke={1.5} />
                    </button>
                  )}
                </ConfirmDialog>
              </>
            )}
          </div>
        </div>

        {editing ? (
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-lg font-bold text-fg focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-brand/30"
              rows={5}
            />
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  if (!editTitle.trim() || !editContent.trim()) return;
                  const res = await apiFetch(`/api/posts/${post.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      title: editTitle.trim(),
                      content: editContent.trim(),
                    }),
                  });
                  if (res.ok) {
                    setEditing(false);
                    queryClient.invalidateQueries({ queryKey: ["posts", uuid] });
                  }
                }}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                {t.save}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="text-sm text-muted underline transition-colors hover:text-fg"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {post.imageUrl && (
              <img
                src={imageUrl(post.imageUrl, "full")}
                alt=""
                className="max-h-96 w-full rounded-xl object-cover shadow-sm"
                loading="lazy"
              />
            )}
            <h1 className="text-xl font-bold leading-tight text-fg">{post.title}</h1>
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-muted">
              {post.content}
            </p>
            <div className="flex items-center gap-1.5 border-t border-border pt-3 text-xs text-muted">
              <IconMessageCircle size={14} stroke={1.5} />
              {t.comments.replace("{count}", String(post._count?.comments ?? post.comments?.length ?? 0))}
            </div>
          </div>
        )}
      </div>

      {post.reactionBreakdown && post.reactionBreakdown.length > 0 && (
        <div className="rounded-xl border border-border p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
            {t.reactionBreakdown}
          </h3>
          <div className="flex flex-wrap gap-2">
            {post.reactionBreakdown.map((r) => (
              <div
                key={r.type}
                className="flex items-center gap-1 rounded-full bg-surface px-3 py-1"
              >
                <span className="text-sm">{r.type}</span>
                <span className="text-xs font-medium text-muted">{r.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {post.whoReacted && post.whoReacted.length > 0 && (
        <div className="rounded-xl border border-border p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
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
                  className="h-6 w-6 bg-brand text-[9px] text-white"
                />
                <span className="text-sm text-fg">{r.name ?? t.unknown}</span>
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

function PostDetailSkeleton() {
  const skeletonSwipeRef = useYSwipeGesture<HTMLDivElement>();
  return (
    <div ref={skeletonSwipeRef} className="mx-auto flex w-full max-w-2xl min-h-0 max-h-full flex-col gap-4 overflow-y-auto py-6 max-md:px-1">
      <div className="h-4 w-12 animate-pulse rounded bg-surface-hover" />
      <div className="surface flex flex-col gap-3 rounded-xl border border-border p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-pulse rounded-full bg-surface-hover" />
          <div className="flex flex-col gap-1">
            <div className="h-3 w-24 animate-pulse rounded bg-surface-hover" />
            <div className="h-2 w-16 animate-pulse rounded bg-surface-hover" />
          </div>
        </div>
        <div className="h-6 w-3/4 animate-pulse rounded bg-surface-hover" />
        <div className="flex flex-col gap-2">
          <div className="h-3 w-full animate-pulse rounded bg-surface-hover" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-surface-hover" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-surface-hover" />
        </div>
      </div>
    </div>
  );
}

export function PremiumPageView() {
  return (
    <Suspense fallback={<PostDetailSkeleton />}>
      <ErrorBoundary>
        <PostDetailContent />
      </ErrorBoundary>
    </Suspense>
  );
}
