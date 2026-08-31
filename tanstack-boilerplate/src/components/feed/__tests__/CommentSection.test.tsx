import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CommentSection } from "../CommentSection";
import type { Comment } from "@/types/feed/CommentSection-types";

const t = {
  editCommentFailed: "EDIT_COMMENT_FAILED",
  deleteCommentFailed: "DELETE_COMMENT_FAILED",
  createCommentFailed: "CREATE_COMMENT_FAILED",
  you: "YOU_LABEL",
};

const toastMock = vi.fn();
const updateCommentMock = vi.fn();
const deleteCommentMock = vi.fn();
const createCommentMock = vi.fn();

vi.mock("@/lib/i18n/MessagesProvider", () => ({
  useMessages: () => t,
}));
vi.mock("@/components/ui/Toast", () => ({
  useToast: () => ({ toast: toastMock }),
}));
vi.mock("@/hooks/useDateDisplayCookie", () => ({
  useDateDisplayCookie: () => "short",
}));
vi.mock("@/api/client/posts/actions", () => ({
  usePostActions: () => ({
    createComment: createCommentMock,
    updateComment: updateCommentMock,
    deleteComment: deleteCommentMock,
  }),
}));
vi.mock("../CommentComposer", () => ({
  CommentComposer: ({
    body,
    setBody,
    onSubmit,
  }: {
    body: string;
    setBody: (v: string) => void;
    onSubmit: (e: { preventDefault: () => void }) => void;
  }) => (
    <>
      <input
        aria-label="comment-body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <button onClick={() => onSubmit({ preventDefault: () => {} })}>
        submit-comment
      </button>
    </>
  ),
}));
vi.mock("../CommentList", () => ({
  CommentList: ({
    onStartEdit,
    onSaveEdit,
    onDelete,
    comments,
  }: {
    onStartEdit: (c: Comment) => void;
    onSaveEdit: (c: Comment) => void;
    onDelete: (c: Comment) => void;
    comments: Comment[];
  }) => (
    <>
      <button onClick={() => onStartEdit(comments[0])}>start-edit</button>
      <button onClick={() => onSaveEdit(comments[0])}>save-edit</button>
      <button onClick={() => onDelete(comments[0])}>delete-comment</button>
      <ul>
        {comments.map((c) => (
          <li key={c.id}>{c.author.name}</li>
        ))}
      </ul>
    </>
  ),
}));

const mockComment: Comment = {
  id: "c1",
  body: "Hello",
  createdAt: new Date().toISOString(),
  author: { id: "u1", name: "Alice", email: "alice@example.com" },
};

describe("CommentSection failure feedback", () => {
  it("shows a failure toast when saving a comment edit fails", async () => {
    toastMock.mockClear();
    updateCommentMock.mockRejectedValueOnce(new Error("network"));

    render(
      <CommentSection
        postId="p1"
        comments={[mockComment]}
        currentUserId="u1"
        onCommentAdded={undefined}
      />,
    );
    fireEvent.click(screen.getByText("start-edit"));
    fireEvent.click(screen.getByText("save-edit"));

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: t.editCommentFailed }),
      ),
    );
  });

  it("shows a failure toast when deleting a comment fails", async () => {
    toastMock.mockClear();
    deleteCommentMock.mockRejectedValueOnce(new Error("network"));

    render(
      <CommentSection
        postId="p1"
        comments={[mockComment]}
        currentUserId="u1"
        onCommentAdded={undefined}
      />,
    );
    fireEvent.click(screen.getByText("delete-comment"));

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: t.deleteCommentFailed }),
      ),
    );
  });

  it("labels the optimistic comment with the translated 'you' label, not a hardcoded one", async () => {
    createCommentMock.mockResolvedValueOnce(undefined);

    render(
      <CommentSection
        postId="p1"
        comments={[]}
        currentUserId="u1"
        onCommentAdded={undefined}
      />,
    );
    fireEvent.change(screen.getByLabelText("comment-body"), {
      target: { value: "new comment" },
    });
    fireEvent.click(screen.getByText("submit-comment"));

    await waitFor(() => expect(screen.getByText(t.you)).toBeTruthy());
  });

  it("shows a translated failure toast when creating a comment fails", async () => {
    toastMock.mockClear();
    createCommentMock.mockRejectedValueOnce(new Error("network"));

    render(
      <CommentSection
        postId="p1"
        comments={[]}
        currentUserId="u1"
        onCommentAdded={undefined}
      />,
    );
    fireEvent.change(screen.getByLabelText("comment-body"), {
      target: { value: "new comment" },
    });
    fireEvent.click(screen.getByText("submit-comment"));

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: t.createCommentFailed }),
      ),
    );
  });
});
