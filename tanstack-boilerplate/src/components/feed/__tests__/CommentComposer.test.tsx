import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CommentComposer } from "../CommentComposer";

const t = {
  reply: "REPLY_LABEL",
  send: "SEND_LABEL",
  cancel: "CANCEL_LABEL",
  writeCommentPlaceholder: "WRITE_COMMENT_PLACEHOLDER",
  replyPlaceholder: "REPLY_PLACEHOLDER",
};

vi.mock("@/lib/i18n/MessagesProvider", () => ({
  useMessages: () => t,
}));

describe("CommentComposer", () => {
  it("shows the translated placeholder and Send label when composing a top-level comment", () => {
    render(
      <CommentComposer
        body=""
        setBody={vi.fn()}
        replyTo={null}
        setReplyTo={vi.fn()}
        submitting={false}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByPlaceholderText(t.writeCommentPlaceholder)).toBeTruthy();
    expect(screen.getByText(t.send)).toBeTruthy();
    expect(screen.queryByText("Send")).toBeNull();
    expect(screen.queryByPlaceholderText("Write a comment...")).toBeNull();
  });

  it("shows the translated reply placeholder, Reply label, and Cancel button when replying", () => {
    render(
      <CommentComposer
        body=""
        setBody={vi.fn()}
        replyTo="c1"
        setReplyTo={vi.fn()}
        submitting={false}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByPlaceholderText(t.replyPlaceholder)).toBeTruthy();
    expect(screen.getByText(t.reply)).toBeTruthy();
    expect(screen.getByText(t.cancel)).toBeTruthy();
    expect(screen.queryByText("Cancel")).toBeNull();
  });
});
