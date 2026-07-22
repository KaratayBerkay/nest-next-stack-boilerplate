"use client";

import { useState } from "react";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { ScrollToBottomButton } from "@/components/ui/ScrollToBottomButton";

interface Message {
  id: string;
  user: string;
  time: string;
  text: string;
}

const INITIAL_MESSAGES: Message[] = [
  { id: "1", user: "Alice", time: "10:28", text: "Hey, how's it going?" },
  {
    id: "2",
    user: "Bob",
    time: "10:30",
    text: "Pretty good! Just shipped the new feature.",
  },
  {
    id: "3",
    user: "Alice",
    time: "10:32",
    text: "Nice! I'll review the PR now.",
  },
  {
    id: "4",
    user: "Bob",
    time: "10:35",
    text: "Thanks, let me know if you need anything.",
  },
  {
    id: "5",
    user: "Alice",
    time: "10:38",
    text: "Will do. Looks clean so far.",
  },
  {
    id: "6",
    user: "Bob",
    time: "10:40",
    text: "I also added the tests we discussed.",
  },
];

const NAMES = ["Alice", "Bob", "Charlie", "Diana"];
const REPLIES = [
  "Sounds good!",
  "Let me check.",
  "On it.",
  "Done!",
  "Will do.",
  "LGTM 👍",
  "Pushed a fix.",
  "Can you review?",
  "Merged to main.",
  "Deployed to staging.",
];

let nextMessageId = 7;

function addChatMessage(
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
) {
  const user = NAMES[Math.floor(Math.random() * NAMES.length)];
  const text = REPLIES[Math.floor(Math.random() * REPLIES.length)];
  setMessages((prev) => [
    ...prev,
    { id: String(nextMessageId++), user, time: "12:00", text },
  ]);
}

export function ChatPaneDemo() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const { bottomRef, scrollToBottom, isAtBottom } = useAutoScroll(messages);

  return (
    <div className="border-border bg-surface relative flex flex-col rounded-lg border">
      <div
        role="region"
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- axe scrollable-region-focusable: keyboard users must be able to scroll this pane
        tabIndex={0}
        aria-label="Chat messages"
        className="scroll-fade-y flex flex-col gap-3 overflow-y-auto p-4"
        style={{ height: "400px" }}
      >
        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col gap-0.5">
            <div className="flex items-baseline gap-2">
              <span className="text-fg text-xs font-medium">{msg.user}</span>
              <span className="text-muted text-[10px]">{msg.time}</span>
            </div>
            <span className="text-fg text-sm">{msg.text}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      {!isAtBottom && <ScrollToBottomButton onClick={scrollToBottom} />}
      <div className="border-border/50 flex items-center justify-between border-t px-4 py-2">
        <button
          onClick={() => addChatMessage(setMessages)}
          className="hover:bg-surface-hover text-fg rounded-md px-3 py-1 text-xs transition-colors"
        >
          New message
        </button>
        <span className="text-muted text-xs tabular-nums">
          {messages.length} messages
        </span>
      </div>
    </div>
  );
}
