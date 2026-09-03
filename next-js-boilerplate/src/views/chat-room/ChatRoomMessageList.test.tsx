import { createRef } from "react";
import { describe, it, expect, vi } from "vitest";

// The actions menu (ConfirmDialog / IconButton / DropdownMenu) reads the
// theme; the list itself has no ThemeProvider in this harness.
vi.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({ componentStyle: "default" as const }),
}));
import { render, screen } from "@testing-library/react";
import { ChatRoomMessageList } from "./ChatRoomMessageList";
import type { ChatRoomMessage } from "@/types/chat-room/ChatRoomMessage-types";

const t = {
  messageFailedToSend: "Failed to send",
  noMessages: "No messages",
  deletedMessage: "DELETED",
  messageActions: "ACTIONS",
  you: "YOU",
  attachmentPreview: "ATTACHMENT",
  decryptionFailed: "DECRYPT_FAILED",
  deleteForEveryoneConfirmTitle: "t",
  deleteForEveryoneConfirmDescription: "d",
  deleteForEveryone: "DFE",
  deleteForMe: "DFM",
  reply: "REPLY",
};

function renderList(
  messages: ChatRoomMessage[],
  handlers?: {
    onReply: (m: ChatRoomMessage) => void;
    onDelete: (id: string, scope: "me" | "everyone") => void;
  },
) {
  return render(
    <ChatRoomMessageList
      onReply={handlers?.onReply}
      onDelete={handlers?.onDelete}
      messages={messages}
      userId="u1"
      onlineUserIds={new Set()}
      msgsLoading={false}
      msgsError={false}
      hasNextPage={false}
      onFetchNextPage={() => {}}
      bottomRef={createRef<HTMLDivElement>()}
      t={t}
    />,
  );
}

describe("ChatRoomMessageList", () => {
  it("shows a failed-to-send indicator on a message the send timeout marked failed", () => {
    renderList([
      {
        id: "temp-1",
        senderId: "u1",
        senderName: "Me",
        body: "hello",
        createdAt: new Date().toISOString(),
        failed: true,
      },
    ]);

    expect(screen.getByText("Failed to send")).toBeTruthy();
  });

  it("does not show the failed indicator for a normally sent message", () => {
    renderList([
      {
        id: "m1",
        senderId: "u1",
        senderName: "Me",
        body: "hello",
        createdAt: new Date().toISOString(),
      },
    ]);

    expect(screen.queryByText("Failed to send")).toBeNull();
  });

  // CROSS-024: reply-to + delete for chat rooms.
  describe("reply + delete (CROSS-024)", () => {
    const handlers = { onReply: () => {}, onDelete: () => {} };

    it("renders a deleted-for-everyone row as a tombstone, not as a decryption failure", () => {
      renderList(
        [
          {
            id: "m1",
            senderId: "u2",
            senderName: "Bea",
            body: null,
            attachments: [],
            deletedAt: "2026-09-03T10:05:00.000Z",
            createdAt: new Date().toISOString(),
          },
        ],
        handlers,
      );
      expect(screen.getByText("DELETED")).toBeTruthy();
      expect(screen.queryByText("DECRYPT_FAILED")).toBeNull();
      // No actions menu on a tombstone.
      expect(screen.queryByLabelText("ACTIONS")).toBeNull();
    });

    it("shows the quoted author and body above a reply, labelling my own quoted message as you", () => {
      renderList(
        [
          {
            id: "m2",
            senderId: "u2",
            senderName: "Bea",
            body: "sure!",
            createdAt: new Date().toISOString(),
            replyTo: {
              id: "m1",
              senderId: "u1",
              senderName: "Me",
              body: "lunch?",
              deletedAt: null,
              hasAttachments: false,
            },
          },
          {
            id: "m3",
            senderId: "u1",
            senderName: "Me",
            body: "ok",
            createdAt: new Date().toISOString(),
            replyTo: {
              id: "m2",
              senderId: "u2",
              senderName: "Bea",
              body: null,
              deletedAt: "2026-09-03T10:05:00.000Z",
              hasAttachments: false,
            },
          },
        ],
        handlers,
      );
      expect(screen.getByText("YOU")).toBeTruthy();
      expect(screen.getByText("lunch?")).toBeTruthy();
      // "Bea" appears as m2's sender label AND as the quote label on m3.
      expect(screen.getAllByText("Bea").length).toBeGreaterThanOrEqual(2);
      // A quote of a since-deleted message shows the tombstone text.
      expect(screen.getByText("DELETED")).toBeTruthy();
    });

    it("offers the actions menu on live messages only when handlers are wired", () => {
      const msg: ChatRoomMessage = {
        id: "m1",
        senderId: "u2",
        senderName: "Bea",
        body: "hi",
        createdAt: new Date().toISOString(),
      };
      const { unmount } = renderList([msg]);
      expect(screen.queryByLabelText("ACTIONS")).toBeNull();
      unmount();
      renderList([msg], handlers);
      expect(screen.getByLabelText("ACTIONS")).toBeTruthy();
    });

    it("hides the actions menu on pending and failed sends", () => {
      renderList(
        [
          {
            id: "temp-1",
            senderId: "u1",
            senderName: "Me",
            body: "…",
            createdAt: new Date().toISOString(),
            pending: true,
          },
          {
            id: "temp-2",
            senderId: "u1",
            senderName: "Me",
            body: "…",
            createdAt: new Date().toISOString(),
            failed: true,
          },
        ],
        handlers,
      );
      expect(screen.queryByLabelText("ACTIONS")).toBeNull();
    });
  });
});
