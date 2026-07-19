import { useQueryClient } from "@tanstack/react-query";

export function usePostActions() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["feed"] }),
      queryClient.invalidateQueries({ queryKey: ["posts"] }),
    ]);

  const createPost = async (
    title: string,
    content: string,
    imageUrl?: string,
  ) => {
    const { createPostServer } = await import("@/api/server/posts/create");
    await createPostServer(title, content, imageUrl);
    await invalidate();
  };

  const updatePost = async (id: string, title: string, content: string) => {
    const { updatePostServer } = await import("@/api/server/posts/update");
    await updatePostServer(id, title, content);
    await invalidate();
  };

  const deletePost = async (id: string) => {
    const { deletePostServer } = await import("@/api/server/posts/delete");
    await deletePostServer(id);
    await invalidate();
  };

  const toggleReaction = async (params: {
    type: string;
    postId?: string;
    commentId?: string;
  }) => {
    const { toggleReactionServer } =
      await import("@/api/server/posts/reactions");
    await toggleReactionServer(params);
    await invalidate();
  };

  const createComment = async (
    postId: string,
    body: string,
    parentId?: string | null,
  ) => {
    const { createCommentServer } = await import("@/api/server/posts/comments");
    await createCommentServer(postId, body, parentId);
    await invalidate();
  };

  const updateComment = async (commentId: string, body: string) => {
    const { updateCommentServer } = await import("@/api/server/posts/comments");
    await updateCommentServer(commentId, body);
    await invalidate();
  };

  const deleteComment = async (commentId: string) => {
    const { deleteCommentServer } = await import("@/api/server/posts/comments");
    await deleteCommentServer(commentId);
    await invalidate();
  };

  const refreshPost = async (id: string) => {
    const { fetchSinglePostServer } = await import("@/api/server/posts/single");
    return fetchSinglePostServer(id);
  };

  return {
    createPost,
    updatePost,
    deletePost,
    toggleReaction,
    createComment,
    updateComment,
    deleteComment,
    refreshPost,
  };
}
