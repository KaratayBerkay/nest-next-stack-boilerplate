"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { IconArrowLeft } from "@tabler/icons-react";
import { useAuth } from "@/hooks/useAuth";
import { useYSwipeGesture } from "@/hooks/useYSwipeGesture";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useRealtime } from "@/lib/realtime/RealtimeProvider";
import { CommentSection } from "@/components/feed/CommentSection";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useMarkPostNotificationsRead } from "@/lib/notifications/useMarkPostNotificationsRead";
import { PostDetailFallback } from "@/fallbacks";
import { singlePostQueryOptions } from "@/api/client/posts/query";
import { usePostActions } from "@/api/client/posts/actions";
import { cn } from "@/lib/cn";
import { PostHeader } from "./PostHeader";
import { PostEditForm } from "./PostEditForm";
import { PostContentView } from "./PostContentView";
import { ReactionBreakdown } from "./ReactionBreakdown";
import { WhoReacted } from "./WhoReacted";
import type { PostDetailBaseViewProps } from "@/types/posts/PostDetailBaseView-types";
import type { Post } from "@/types/posts/Post-types";

function PostDetailContent({
  showPageInfo = false,
  showReactionBreakdown = false,
  showWhoReacted = false,
  initialPostData,
  className,
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
  const { updatePost, deletePost } = usePostActions();

  useEffect(() => {
    if (!uuid) return;
    const topic = `post:${uuid}`;
    realtime?.watch(topic);
    return () => realtime?.unwatch(topic);
  }, [realtime, uuid]);

  useMarkPostNotificationsRead(uuid);

  const { data: post } = useSuspenseQuery({
    ...singlePostQueryOptions(uuid),
    initialData: initialPostData as Post | undefined,
  });

  async function handleSave() {
    if (!editTitle.trim() || !editContent.trim()) return;
    await updatePost(post.id, editTitle.trim(), editContent.trim());
    setEditing(false);
  }

  function handleStartEdit() {
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditing(true);
  }

  async function handleDelete() {
    await deletePost(post.id);
    router.push(`/v1/${params?.lang ?? "en"}/feed`);
  }

  return (
    <div
      ref={swipeRef}
      className={cn(
        "flex max-h-full min-h-0 w-full flex-col gap-6 overflow-y-auto py-6 max-md:px-1",
        className,
      )}
    >
      <button
        onClick={() => router.push(`/v1/${params?.lang ?? "en"}/feed`)}
        className="text-muted hover:text-fg flex items-center gap-1 text-xs transition-colors"
      >
        <IconArrowLeft size={16} stroke={1.5} />
        {t.back}
      </button>

      <div className="surface flex flex-col gap-4 p-5">
        <PostHeader
          post={post}
          uuid={uuid}
          editing={editing}
          currentUserId={user?.id}
          showPageInfo={showPageInfo}
          onStartEdit={handleStartEdit}
          onDelete={handleDelete}
        />

        {editing ? (
          <PostEditForm
            post={post}
            editTitle={editTitle}
            editContent={editContent}
            onEditTitleChange={setEditTitle}
            onEditContentChange={setEditContent}
            onSave={handleSave}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <PostContentView post={post} />
        )}
      </div>

      {showReactionBreakdown && <ReactionBreakdown post={post} />}
      {showWhoReacted && <WhoReacted post={post} />}

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
