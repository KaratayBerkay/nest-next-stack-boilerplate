import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CommentList } from "../CommentList";

const t = { noCommentsYet: "NO_COMMENTS_YET" };

vi.mock("@/lib/i18n/MessagesProvider", () => ({
  useMessages: () => t,
}));
vi.mock("../CommentCard", () => ({
  CommentCard: () => null,
}));

describe("CommentList", () => {
  it("shows the translated empty state instead of hardcoded English", () => {
    render(
      <CommentList
        comments={[]}
        editingId={null}
        editingBody=""
        isOwn={() => false}
        onToggleReply={vi.fn()}
        onEditingBodyChange={vi.fn()}
        onStartEdit={vi.fn()}
        onSaveEdit={vi.fn()}
        onCancelEdit={vi.fn()}
        onDelete={vi.fn()}
        currentUserId={null}
        onCommentAdded={undefined}
        dateDisplay="short"
      />,
    );

    expect(screen.getByText(t.noCommentsYet)).toBeTruthy();
    expect(screen.queryByText("No comments yet.")).toBeNull();
  });
});
