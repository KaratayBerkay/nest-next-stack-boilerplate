import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import type { ReactNode } from "react";
import { PostHeader } from "../PostHeader";
import type { Post } from "@/types/feed/PostCard-types";

const t = {
  editPost: "EDIT_POST_LABEL",
  deletePost: "DELETE_POST_LABEL",
  deletePostConfirm: "DELETE_POST_CONFIRM",
  viewPost: "VIEW_POST_LABEL",
};

vi.mock("@/lib/i18n/MessagesProvider", () => ({
  useMessages: () => t,
}));
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "u1" } }),
}));
vi.mock("next/navigation", () => ({
  useParams: () => ({ lang: "en" }),
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
// PostHeader's own behavior under test is "passes the translated strings
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

const mockPost: Post = {
  id: "p1",
  title: "Title",
  content: "Content",
  createdAt: new Date().toISOString(),
  author: { id: "u1", name: "Alice", email: "alice@example.com" },
  reactions: [],
};

describe("PostHeader (feed)", () => {
  it("uses translated labels for edit/delete instead of hardcoded English", () => {
    render(
      <PostHeader
        postData={mockPost}
        isOwn
        editing={false}
        onRefresh={vi.fn()}
        onEditStart={vi.fn()}
        onDeleteConfirm={vi.fn()}
      />,
    );

    expect(screen.getByLabelText(t.editPost)).toBeTruthy();
    expect(screen.getByLabelText(t.deletePost)).toBeTruthy();
    expect(screen.queryByLabelText("Edit post")).toBeNull();
    expect(screen.queryByLabelText("Delete post")).toBeNull();
  });

  it("passes the translated confirm dialog title/description, not hardcoded English", () => {
    render(
      <PostHeader
        postData={mockPost}
        isOwn
        editing={false}
        onRefresh={vi.fn()}
        onEditStart={vi.fn()}
        onDeleteConfirm={vi.fn()}
      />,
    );

    expect(screen.getByText(t.deletePostConfirm)).toBeTruthy();
    expect(
      screen.queryByText("Are you sure you want to delete this post?"),
    ).toBeNull();
  });

  it("gives the icon-only view-post link an accessible name", () => {
    render(
      <PostHeader
        postData={mockPost}
        isOwn={false}
        editing={false}
        onRefresh={vi.fn()}
        onEditStart={vi.fn()}
        onDeleteConfirm={vi.fn()}
      />,
    );

    expect(screen.getByLabelText(t.viewPost)).toBeTruthy();
  });
});
