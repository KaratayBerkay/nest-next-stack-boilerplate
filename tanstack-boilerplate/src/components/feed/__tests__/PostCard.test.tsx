import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PostCard } from "../PostCard";
import type { Post } from "@/types/feed/PostCard-types";

const t = {
  save: "SAVE_LABEL",
  cancel: "CANCEL_LABEL",
  editPostFailed: "EDIT_POST_FAILED",
  deletePostFailed: "DELETE_POST_FAILED",
};

const toastMock = vi.fn();
const updatePostMock = vi.fn();
const deletePostMock = vi.fn();

vi.mock("@/lib/i18n/MessagesProvider", () => ({
  useMessages: () => t,
}));
vi.mock("@/components/ui/Toast", () => ({
  useToast: () => ({ toast: toastMock }),
}));
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "u1" } }),
}));
vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    useSuspenseQuery: () => ({ data: mockPost }),
    useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  };
});
vi.mock("@/api/client/posts/actions", () => ({
  usePostActions: () => ({
    updatePost: updatePostMock,
    deletePost: deletePostMock,
  }),
}));
vi.mock("@/api/client/posts/query", () => ({
  singlePostQueryOptions: () => ({}),
}));
vi.mock("../PostHeader", () => ({
  PostHeader: ({
    onEditStart,
    onDeleteConfirm,
  }: {
    onEditStart: () => void;
    onDeleteConfirm: () => void;
  }) => (
    <>
      <button onClick={onEditStart}>start-edit</button>
      <button onClick={onDeleteConfirm}>delete-post</button>
    </>
  ),
}));
vi.mock("../PostContent", () => ({ PostContent: () => null }));
vi.mock("../PostActions", () => ({ PostActions: () => null }));

const mockPost: Post = {
  id: "p1",
  title: "Title",
  content: "Content",
  createdAt: new Date().toISOString(),
  author: { id: "u1", name: "Alice", email: "alice@example.com" },
  reactions: [],
  comments: [],
};

describe("PostCard", () => {
  it("shows translated Save/Cancel labels in edit mode instead of hardcoded English", () => {
    render(<PostCard post={mockPost} />);
    fireEvent.click(screen.getByText("start-edit"));

    expect(screen.getByText(t.save)).toBeTruthy();
    expect(screen.getByText(t.cancel)).toBeTruthy();
    expect(screen.queryByText("Save")).toBeNull();
    expect(screen.queryByText("Cancel")).toBeNull();
  });

  it("shows a failure toast and stays in edit mode when saving a failed edit", async () => {
    toastMock.mockClear();
    updatePostMock.mockRejectedValueOnce(new Error("network"));

    render(<PostCard post={mockPost} />);
    fireEvent.click(screen.getByText("start-edit"));
    fireEvent.click(screen.getByText(t.save));

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: t.editPostFailed }),
      ),
    );
    // Edit mode (Save/Cancel) is still showing — the failed save didn't
    // silently exit editing.
    expect(screen.getByText(t.save)).toBeTruthy();
  });

  it("shows a failure toast when deleting a post fails", async () => {
    toastMock.mockClear();
    deletePostMock.mockRejectedValueOnce(new Error("network"));

    render(<PostCard post={mockPost} />);
    fireEvent.click(screen.getByText("delete-post"));

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: t.deletePostFailed }),
      ),
    );
  });
});
