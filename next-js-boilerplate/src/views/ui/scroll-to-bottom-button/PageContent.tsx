"use client";

import { useState, useRef } from "react";
import { ScrollToBottomButton } from "@/components/ui/ScrollToBottomButton";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

interface Message {
  id: string;
  user: string;
  text: string;
}

const initialMessages: Message[] = [
  { id: "1", user: "Alice", text: "Hey, how's it going?" },
  { id: "2", user: "Bob", text: "Pretty good! Just shipped the new feature." },
  { id: "3", user: "Alice", text: "Nice! I'll review the PR now." },
  { id: "4", user: "Bob", text: "Thanks, let me know if you need anything." },
  { id: "5", user: "Alice", text: "Will do. Looks clean so far." },
  { id: "6", user: "Bob", text: "I also added the tests we discussed." },
  { id: "7", user: "Alice", text: "Perfect. Approving now." },
  { id: "8", user: "Bob", text: "Great, merging it in." },
];

const names = ["Alice", "Bob", "Charlie", "Diana"];
const replies = [
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

let nextId = 9;

function ChatThreadDemo() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const { bottomRef, scrollToBottom, isAtBottom } = useAutoScroll(messages);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  function addMessage() {
    const user = names[Math.floor(Math.random() * names.length)];
    const text = replies[Math.floor(Math.random() * replies.length)];
    setMessages((prev) => [...prev, { id: String(nextId++), user, text }]);
  }

  return (
    <div className="border-border bg-surface relative flex flex-col rounded-lg border">
      <div
        ref={scrollContainerRef}
        role="region"
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- axe scrollable-region-focusable: keyboard users must be able to scroll this pane
        tabIndex={0}
        aria-label="Message list"
        className="scroll-fade-y h-72 overflow-y-auto p-4"
      >
        <div className="flex flex-col gap-3">
          {messages.map((msg) => (
            <div key={msg.id} className="flex flex-col">
              <span className="text-muted text-xs">{msg.user}</span>
              <span className="text-fg text-sm">{msg.text}</span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>
      {!isAtBottom && <ScrollToBottomButton onClick={scrollToBottom} />}
      <div className="border-border/50 flex items-center justify-between border-t px-4 py-2">
        <button
          onClick={addMessage}
          className="hover:bg-surface-hover text-fg rounded-md px-3 py-1 text-xs transition-colors"
        >
          Add message
        </button>
        <span className="text-muted text-xs tabular-nums">
          {messages.length} messages
        </span>
      </div>
    </div>
  );
}

const examples: UIExample[] = [
  {
    id: "chat-thread",
    title: "Chat Thread",
    description:
      "Messages list with auto-scroll. Button appears when scrolled up.",
    render: () => <ChatThreadDemo />,
  },
];

export default function ScrollToBottomButtonPage({
  initialTab,
}: {
  initialTab?: string;
}) {
  return (
    <ExampleTabs
      title="Scroll To Bottom Button"
      intro="A button that scrolls to the bottom of a container."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
