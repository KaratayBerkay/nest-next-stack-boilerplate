"use client";

import { ScrollToBottomButton } from "@/components/ui/ScrollToBottomButton";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const chatMessages = [
  { id: 1, user: "Alice", text: "Hey, how's it going?" },
  { id: 2, user: "Bob", text: "Pretty good! Just shipped the new feature." },
  { id: 3, user: "Alice", text: "Nice! I'll review the PR now." },
  { id: 4, user: "Bob", text: "Thanks, let me know if you need anything." },
  { id: 5, user: "Alice", text: "Will do. Looks clean so far." },
  { id: 6, user: "Bob", text: "I also added the tests we discussed." },
  { id: 7, user: "Alice", text: "Perfect. Approving now." },
  { id: 8, user: "Bob", text: "Great, merging it in." },
];

function ChatThreadDemo() {
  return (
    <div className="border-border bg-surface relative overflow-hidden rounded-lg border">
      <div className="h-72 overflow-y-auto p-4">
        <div className="flex flex-col gap-3">
          {chatMessages.map((msg) => (
            <div key={msg.id} className="flex flex-col">
              <span className="text-muted text-xs">{msg.user}</span>
              <span className="text-fg text-sm">{msg.text}</span>
            </div>
          ))}
        </div>
      </div>
      <ScrollToBottomButton onClick={() => {}} />
    </div>
  );
}

const examples: UIExample[] = [
  {
    id: "chat-thread",
    title: "Chat Thread",
    description: "Button that appears when scrolled up from the bottom.",
    render: () => <ChatThreadDemo />,
  },
];

export default function ScrollToBottomButtonPage() {
  return (
    <ExampleTabs
      title="Scroll To Bottom Button"
      intro="A button that scrolls to the bottom of a container."
      examples={examples}
    />
  );
}
