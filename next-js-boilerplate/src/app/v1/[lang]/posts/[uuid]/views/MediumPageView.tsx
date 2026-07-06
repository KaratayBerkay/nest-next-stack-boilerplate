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
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useRealtime } from "@/lib/realtime/RealtimeProvider";
import { imageUrl } from "@/lib/image";
import { ReactionInline } from "@/components/feed/ReactionButtons";
import { CommentSection } from "@/components/feed/CommentSection";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { useMessages } from "@/lib/i18n/MessagesProvider";

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
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    if (!uuid) return;
    const topic = `post:${uuid}`;
    realtime?.watch(topic);
    return () => realtime?.unwatch(topic);
  }, [realtime, uuid]);

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
    <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-xs text-muted transition-colors hover:text-fg"
      >
        <IconArrowLeft size={16} stroke={1.5} />
        {t.back}
      </button>

      <div className="surface flex flex-col gap-3 rounded-xl border border-border p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white">
              {(post.author.name || post.author.email).charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-fg">
                {post.author.name || post.author.email}
              </p>
              <p className="text-[10px] text-muted">
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
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
                  className="p-1 text-muted hover:text-fg"
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
                      className="p-1 text-muted hover:text-red-500"
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
          <>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full rounded border border-border bg-surface px-3 py-2 text-lg font-bold text-fg"
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full rounded border border-border bg-surface px-3 py-2 text-sm text-fg"
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
                className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white"
              >
                {t.save}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="text-sm text-muted underline"
              >
                {t.cancel}
              </button>
            </div>
          </>
        ) : (
          <>
            {post.imageUrl && (
              <img
                src={imageUrl(post.imageUrl, "full")}
                alt=""
                className="max-h-80 w-full rounded-lg object-cover"
                loading="lazy"
              />
            )}
            <h1 className="text-lg font-bold text-fg">{post.title}</h1>
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-muted">
              {post.content}
            </p>
          </>
        )}

        <div className="flex items-center gap-1 text-xs text-muted">
          <IconMessageCircle size={14} stroke={1.5} />
          {t.comments.replace("{count}", String(post._count?.comments ?? post.comments?.length ?? 0))}
        </div>
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

      <CommentSection
        postId={post.id}
        comments={post.comments ?? []}
        currentUserId={user?.id}
        onCommentAdded={() =>
          queryClient.invalidateQueries({ queryKey: ["posts", uuid] })
        }
        maxTopLevel={10}
        pageable
      />
    </div>
  );
}

function PostDetailSkeleton() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-6">
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

export function MediumPageView() {
  return (
    <Suspense fallback={<PostDetailSkeleton />}>
      <ErrorBoundary>
        <PostDetailContent />
      </ErrorBoundary>
    </Suspense>
  );
}
