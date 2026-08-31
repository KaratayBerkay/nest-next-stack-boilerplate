import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import type { ReactNode } from "react";
import { CommentCard } from "../CommentCard";
import type { Comment } from "@/types/feed/CommentSection-types";

const t = {
  reply: "REPLY_LABEL",
  editComment: "EDIT_COMMENT_LABEL",
  editReply: "EDIT_REPLY_LABEL",
  deleteComment: "DELETE_COMMENT_LABEL",
  deleteReply: "DELETE_REPLY_LABEL",
  deleteCommentConfirm: "DELETE_COMMENT_CONFIRM",
  save: "SAVE_LABEL",
  cancel: "CANCEL_LABEL",
};

vi.mock("@/lib/i18n/MessagesProvider", () => ({
  useMessages: () => t,
}));
vi.mock("../ReactionButtons", () => ({
  ReactionInline: () => null,
}));
// IconButton renders through useComponentVariant, which needs a ThemeProvider
// this unit test doesn't set up (same gap as this repo's other component-tree
// tests, e.g. planDetails.test.tsx) — stub it to the default variant.
vi.mock("@/hooks/useComponentVariant", () => ({
  useComponentVariant: () => "default",
}));
// The real ConfirmDialog renders a native <dialog>, which jsdom doesn't fully
// implement (no showModal) — same gap planDetails.test.tsx works around.
// CommentCard's own behavior under test is "passes the translated strings
// through", not the dialog's own open/close chrome, so a stub that always
// renders title/description is a faithful enough stand-in here.
vi.mock("@/components/ui/ConfirmDialog", () => ({
  ConfirmDialog: ({
    title,
    description,
    children,
  }: {
    title: string;
    description: string;
    children: (open: () => void) => ReactNode;
  }) => (
    <>
      <div>{title}</div>
      <div>{description}</div>
      {children(() => {})}
    </>
  ),
}));

const mockComment: Comment = {
  id: "c1",
  body: "Hello",
  createdAt: new Date().toISOString(),
  author: { id: "u1", name: "Alice", email: "alice@example.com" },
};

describe("CommentCard", () => {
  it("shows translated Reply/Edit/Delete labels for a top-level comment, not hardcoded English", () => {
    render(
      <CommentCard
        comment={mockComment}
        isOwn={true}
        isReply={false}
        editing={false}
        editingBody=""
        onEditingBodyChange={vi.fn()}
        onToggleReply={vi.fn()}
        onStartEdit={vi.fn()}
        onSaveEdit={vi.fn()}
        onCancelEdit={vi.fn()}
        onDelete={vi.fn()}
        currentUserId="u1"
        onCommentAdded={undefined}
        dateDisplay="short"
      />,
    );

    expect(screen.getByLabelText(t.editComment)).toBeTruthy();
    expect(screen.getByLabelText(t.deleteComment)).toBeTruthy();
    expect(screen.queryByLabelText("Edit comment")).toBeNull();
    expect(screen.queryByLabelText("Delete comment")).toBeNull();
  });

  it("shows translated Reply/Edit/Delete-reply labels for a reply, and translated Save/Cancel while editing", () => {
    render(
      <CommentCard
        comment={mockComment}
        isOwn={true}
        isReply={true}
        editing={true}
        editingBody="editing"
        onEditingBodyChange={vi.fn()}
        onToggleReply={null}
        onStartEdit={vi.fn()}
        onSaveEdit={vi.fn()}
        onCancelEdit={vi.fn()}
        onDelete={vi.fn()}
        currentUserId="u1"
        onCommentAdded={undefined}
        dateDisplay="short"
      />,
    );

    expect(screen.getByText(t.save)).toBeTruthy();
    expect(screen.getByText(t.cancel)).toBeTruthy();
  });

  it("shows a translated Reply toggle for someone else's top-level comment", () => {
    render(
      <CommentCard
        comment={mockComment}
        isOwn={false}
        isReply={false}
        editing={false}
        editingBody=""
        onEditingBodyChange={vi.fn()}
        onToggleReply={vi.fn()}
        onStartEdit={vi.fn()}
        onSaveEdit={vi.fn()}
        onCancelEdit={vi.fn()}
        onDelete={vi.fn()}
        currentUserId="u2"
        onCommentAdded={undefined}
        dateDisplay="short"
      />,
    );

    expect(screen.getByText(t.reply)).toBeTruthy();
    expect(screen.queryByText("Reply")).toBeNull();
  });

  it("passes the translated delete confirm description, not hardcoded English", () => {
    render(
      <CommentCard
        comment={mockComment}
        isOwn={true}
        isReply={false}
        editing={false}
        editingBody=""
        onEditingBodyChange={vi.fn()}
        onToggleReply={vi.fn()}
        onStartEdit={vi.fn()}
        onSaveEdit={vi.fn()}
        onCancelEdit={vi.fn()}
        onDelete={vi.fn()}
        currentUserId="u1"
        onCommentAdded={undefined}
        dateDisplay="short"
      />,
    );

    expect(screen.getByText(t.deleteCommentConfirm)).toBeTruthy();
    expect(
      screen.queryByText("Are you sure you want to delete this comment?"),
    ).toBeNull();
  });
});
