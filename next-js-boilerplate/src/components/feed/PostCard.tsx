"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { usePostActions } from "@/api/client/posts/actions";
import type { PostCardProps, Post } from "@/types/feed/PostCard-types";
import { PostHeader } from "./PostHeader";
import { PostContent } from "./PostContent";
import { PostActions } from "./PostActions";

async function refreshPostData(
  postId: string,
  toast: ReturnType<typeof useToast>["toast"],
  setPostData: Dispatch<SetStateAction<Post>>,
  refreshPost: (id: string) => Promise<Post>,
) {
  try {
    const post = await refreshPost(postId);
    setPostData(post);
  } catch {
    toast({ title: "Network error loading post", variant: "destructive" });
  }
}

async function handleEditPost(
  postDataId: string,
  editTitle: string,
  editContent: string,
  setPostData: Dispatch<SetStateAction<Post>>,
  setEditing: Dispatch<SetStateAction<boolean>>,
  updatePost: (id: string, title: string, content: string) => Promise<void>,
  refreshPost: (id: string) => Promise<Post>,
) {
  if (!editTitle.trim() || !editContent.trim()) return;
  try {
    await updatePost(postDataId, editTitle.trim(), editContent.trim());
    const post = await refreshPost(postDataId);
    setPostData(post);
    setEditing(false);
  } catch {
    // silent
  }
}

async function handleDeletePost(
  postDataId: string,
  onDelete: ((id: string) => void) | undefined,
  deletePost: (id: string) => Promise<void>,
) {
  try {
    await deletePost(postDataId);
    onDelete?.(postDataId);
  } catch {
    // silent
  }
}

function handleToggle(
  isExpanded: boolean,
  onToggle: (() => void) | undefined,
  postId: string,
  toast: ReturnType<typeof useToast>["toast"],
  setPostData: Dispatch<SetStateAction<Post>>,
  refreshPost: (id: string) => Promise<Post>,
) {
  const willExpand = !isExpanded;
  onToggle?.();
  if (willExpand) refreshPostData(postId, toast, setPostData, refreshPost);
}

export function PostCard({
  post,
  isExpanded = false,
  onToggle,
  onDelete,
}: PostCardProps) {
  const { user } = useAuth();
  const [postData, setPostData] = useState(post);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const isOwn = user && postData.author.id === user.id;
  const { toast } = useToast();
  const { updatePost, deletePost, refreshPost } = usePostActions();

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
          refreshPostData(postData.id, toast, setPostData, refreshPost)
        }
        onEditStart={() => {
          setEditTitle(postData.title);
          setEditContent(postData.content);
          setEditing(true);
        }}
        onDeleteConfirm={() =>
          handleDeletePost(postData.id, onDelete, deletePost)
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
                setPostData,
                setEditing,
                updatePost,
                refreshPost,
              )
            }
            className="bg-brand rounded-lg px-3 py-1 text-xs font-medium text-brand-fg"
          >
            Save
          </button>
          <button
            onClick={() => setEditing(false)}
            className="text-muted text-xs underline"
          >
            Cancel
          </button>
        </div>
      )}

      <PostActions
        isExpanded={isExpanded}
        postData={postData}
        onToggle={() =>
          handleToggle(
            isExpanded,
            onToggle,
            postData.id,
            toast,
            setPostData,
            refreshPost,
          )
        }
        currentUserId={user?.id}
        onCommentAdded={() =>
          refreshPostData(postData.id, toast, setPostData, refreshPost)
        }
      />
    </div>
  );
}
