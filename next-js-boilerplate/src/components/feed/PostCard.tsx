"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { usePostActions } from "@/api/client/posts/actions";
import { singlePostQueryOptions } from "@/api/client/posts/query";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useToast } from "@/components/ui/Toast";
import type { PostCardProps } from "@/types/feed/PostCard-types";
import { PostHeader } from "./PostHeader";
import { PostContent } from "./PostContent";
import { PostActions } from "./PostActions";

async function handleEditPost(
  postDataId: string,
  editTitle: string,
  editContent: string,
  setEditing: Dispatch<SetStateAction<boolean>>,
  updatePost: (id: string, title: string, content: string) => Promise<void>,
  toast: ReturnType<typeof useToast>["toast"],
  failedMessage: string,
) {
  if (!editTitle.trim() || !editContent.trim()) return;
  try {
    await updatePost(postDataId, editTitle.trim(), editContent.trim());
    setEditing(false);
  } catch {
    toast({ title: failedMessage, variant: "destructive" });
  }
}

async function handleDeletePost(
  postDataId: string,
  onDelete: ((id: string) => void) | undefined,
  deletePost: (id: string) => Promise<void>,
  toast: ReturnType<typeof useToast>["toast"],
  failedMessage: string,
) {
  try {
    await deletePost(postDataId);
    onDelete?.(postDataId);
  } catch {
    toast({ title: failedMessage, variant: "destructive" });
  }
}

function handleToggle(
  isExpanded: boolean,
  onToggle: (() => void) | undefined,
  postId: string,
  queryClient: ReturnType<typeof useQueryClient>,
) {
  const willExpand = !isExpanded;
  onToggle?.();
  if (willExpand) {
    queryClient.invalidateQueries({ queryKey: ["posts", postId] });
  }
}

export function PostCard({
  post,
  isExpanded = false,
  onToggle,
  onDelete,
}: PostCardProps) {
  const { user } = useAuth();
  const t = useMessages("posts");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const { data: postData } = useSuspenseQuery({
    ...singlePostQueryOptions(post.id),
    initialData: post,
    staleTime: 30_000,
  });
  const isOwn = user && postData.author.id === user.id;
  const { updatePost, deletePost } = usePostActions();

  return (
    <div
      id={`post-${postData.id}`}
      className="border-border surface flex flex-col gap-2 rounded-xl border p-3"
    >
      <PostHeader
        postData={postData}
        isOwn={!!isOwn}
        editing={editing}
        onRefresh={() =>
          queryClient.invalidateQueries({ queryKey: ["posts", postData.id] })
        }
        onEditStart={() => {
          setEditTitle(postData.title);
          setEditContent(postData.content);
          setEditing(true);
        }}
        onDeleteConfirm={() =>
          handleDeletePost(
            postData.id,
            onDelete,
            deletePost,
            toast,
            t.deletePostFailed,
          )
        }
      />

      <PostContent
        postData={postData}
        editing={editing}
        editTitle={editTitle}
        editContent={editContent}
        onTitleChange={setEditTitle}
        onContentChange={setEditContent}
      />

      {editing && (
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              handleEditPost(
                postData.id,
                editTitle,
                editContent,
                setEditing,
                updatePost,
                toast,
                t.editPostFailed,
              )
            }
            className="bg-brand text-brand-fg rounded-lg px-3 py-1 text-xs font-medium"
          >
            {t.save}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="text-muted text-xs underline"
          >
            {t.cancel}
          </button>
        </div>
      )}

      <PostActions
        isExpanded={isExpanded}
        postData={postData}
        onToggle={() =>
          handleToggle(isExpanded, onToggle, postData.id, queryClient)
        }
        currentUserId={user?.id}
        onCommentAdded={() =>
          queryClient.invalidateQueries({ queryKey: ["posts", postData.id] })
        }
      />
    </div>
  );
}
