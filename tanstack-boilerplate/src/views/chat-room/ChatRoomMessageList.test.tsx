import { createRef } from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChatRoomMessageList } from "./ChatRoomMessageList";
import type { ChatRoomMessage } from "@/types/chat-room/ChatRoomMessage-types";

const t = { messageFailedToSend: "Failed to send", noMessages: "No messages" };

function renderList(messages: ChatRoomMessage[]) {
  return render(
    <ChatRoomMessageList
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
});
