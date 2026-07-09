"use client";

import { apiFetch } from "@/lib/api-client";
import { useState, type Dispatch, type SetStateAction } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { POSTS_PREFIX } from "@/constants/api/urls";
import { PUT, DELETE } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";
import type { PostCardProps, Post } from "@/types/feed/PostCard-types";
import { PostHeader } from "./PostHeader";
import { PostContent } from "./PostContent";
import { PostActions } from "./PostActions";

async function refreshPostData(
  postId: string,
  toast: ReturnType<typeof useToast>["toast"],
  setPostData: Dispatch<SetStateAction<Post>>,
) {
  try {
    const res = await apiFetch(POSTS_PREFIX + postId);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast({ title: body.error ?? `Failed to load post (${res.status})`, variant: "destructive" });
      return;
    }
    const data = await res.json();
    if (data.post) {
      setPostData(data.post);
    } else {
      toast({ title: "Post not found", variant: "destructive" });
    }
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
) {
  if (!editTitle.trim() || !editContent.trim()) return;
  try {
    const res = await apiFetch(POSTS_PREFIX + postDataId, {
      method: PUT,
      headers: JSON_CONTENT_TYPE_HEADER,
      body: JSON.stringify({
        title: editTitle.trim(),
        content: editContent.trim(),
      }),
    });
    if (!res.ok) return;
    const data = await res.json();
    if (data.post) {
      setPostData(data.post);
      setEditing(false);
    }
  } catch {
    // silent
  }
}

async function handleDeletePost(
  postDataId: string,
  onDelete: ((id: string) => void) | undefined,
) {
  try {
    const res = await apiFetch(POSTS_PREFIX + postDataId, {
      method: DELETE,
    });
    if (!res.ok) return;
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
) {
  const willExpand = !isExpanded;
  onToggle?.();
  if (willExpand) refreshPostData(postId, toast, setPostData);
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

  return (
    <div
      id={`post-${postData.id}`}
      className="border-border surface flex flex-col gap-2 rounded-xl border p-3"
    >
      <PostHeader
        postData={postData}
        isOwn={!!isOwn}
        editing={editing}
        onRefresh={() => refreshPostData(postData.id, toast, setPostData)}
        onEditStart={() => {
          setEditTitle(postData.title);
          setEditContent(postData.content);
          setEditing(true);
        }}
        onDeleteConfirm={() => handleDeletePost(postData.id, onDelete)}
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
            onClick={() => handleEditPost(postData.id, editTitle, editContent, setPostData, setEditing)}
            className="bg-brand rounded-lg px-3 py-1 text-xs font-medium text-white"
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
        onToggle={() => handleToggle(isExpanded, onToggle, postData.id, toast, setPostData)}
        currentUserId={user?.id}
        onCommentAdded={() => refreshPostData(postData.id, toast, setPostData)}
      />
    </div>
  );
}
