"use client";

import { apiFetch } from "@/lib/api-client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  IconArrowLeft,
  IconMessageCircle,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { imageUrl } from "@/lib/image";
import { ReactionInline } from "@/components/feed/ReactionButtons";
import { CommentSection } from "@/components/feed/CommentSection";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

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
  _count?: { comments: number; reactions: number };
}

function PostDetailContent() {
  const params = useParams<{ lang: string; uuid: string }>();
  const uuid = params?.uuid ?? "";
  const router = useRouter();
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const { data: post, isLoading, error } = useQuery<Post | null>({
    queryKey: ["posts", uuid],
    queryFn: async () => {
      const res = await apiFetch(`/api/posts/${uuid}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.post ?? null;
    },
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="text-muted flex animate-pulse items-center justify-center py-20 text-sm">
        Loading...
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-sm text-red-500">{error?.message ?? "Post not found"}</p>
        <button
          onClick={() => router.back()}
          className="text-brand text-xs hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-6">
      <button
        onClick={() => router.back()}
        className="text-muted hover:text-fg flex items-center gap-1 text-xs transition-colors"
      >
        <IconArrowLeft size={16} stroke={1.5} />
        Back
      </button>

      <div className="border-border surface flex flex-col gap-3 rounded-xl border p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="bg-brand flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold text-white">
              {(post.author.name || post.author.email).charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-fg text-sm font-medium">
                {post.author.name || post.author.email}
              </p>
              <p className="text-muted text-[10px]">
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ReactionInline
              postId={post.id}
              reactions={post.reactions ?? []}
              currentUserId={user?.id}
              onReactionChange={() => {}}
            />
            {user && post.author.id === user.id && !editing && (
              <>
                <button
                  onClick={() => {
                    setEditTitle(post.title);
                    setEditContent(post.content);
                    setEditing(true);
                  }}
                  className="text-muted hover:text-fg p-1"
                >
                  <IconPencil size={14} stroke={1.5} />
                </button>
                <ConfirmDialog
                  title="Delete post"
                  description="Are you sure you want to delete this post?"
                  onConfirm={async () => {
                    try {
                      const res = await apiFetch(`/api/posts/${post.id}`, {
                        method: "DELETE",
                      });
                      if (res.ok)
                        router.push(`/v1/${params?.lang ?? "en"}/feed`);
                    } catch {
                      // silent
                    }
                  }}
                >
                  {(open) => (
                    <button
                      onClick={open}
                      className="text-muted p-1 hover:text-red-500"
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
              className="border-border bg-surface text-fg w-full rounded border px-3 py-2 text-lg font-bold"
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="border-border bg-surface text-fg w-full rounded border px-3 py-2 text-sm"
              rows={5}
            />
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  if (!editTitle.trim() || !editContent.trim()) return;
                  try {
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
                    }
                  } catch {
                    // silent
                  }
                }}
                className="bg-brand rounded-lg px-4 py-2 text-sm font-medium text-white"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="text-muted text-sm underline"
              >
                Cancel
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
            <h1 className="text-fg text-lg font-bold">{post.title}</h1>
            <p className="text-muted text-sm leading-relaxed break-words whitespace-pre-wrap">
              {post.content}
            </p>
          </>
        )}

        <div className="text-muted flex items-center gap-1 text-xs">
          <IconMessageCircle size={14} stroke={1.5} />
          {post._count?.comments ?? post.comments?.length ?? 0} comments
        </div>
      </div>

      <CommentSection
        postId={post.id}
        comments={post.comments ?? []}
        currentUserId={user?.id}
        onCommentAdded={() => {}}
        maxTopLevel={10}
        pageable
      />
    </div>
  );
}

export default function PostDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="text-muted flex animate-pulse items-center justify-center py-20 text-sm">
          Loading...
        </div>
      }
    >
      <ErrorBoundary>
        <PostDetailContent />
      </ErrorBoundary>
    </Suspense>
  );
}
