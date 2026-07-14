"use client";

import { useState, useRef, useLayoutEffect, useCallback } from "react";
import { useYSwipeGesture } from "@/hooks/useYSwipeGesture";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { ScrollToBottomButton } from "@/components/ui/ScrollToBottomButton";
import { cn } from "@/lib/cn";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

interface Message {
  id: string;
  user: string;
  time: string;
  text: string;
}

const SECTIONS = [
  { color: "from-sky-500 to-cyan-400", title: "Section A", body: "Drag this pane vertically to scroll. No visible scrollbar — the drag-pan gesture drives scrolling." },
  { color: "from-violet-500 to-purple-600", title: "Section B", body: "Each section is roughly viewport-height. The scroll-fade-y mask softens the top and bottom edges." },
  { color: "from-rose-500 to-pink-500", title: "Section C", body: "Built with the same useYSwipeGesture pattern used across the app." },
];

const TAGS = ["React", "TypeScript", "Tailwind", "Next.js", "Radix UI", "Zustand", "React Query", "Vitest", "Playwright", "Storybook", "tRPC", "Prisma", "Docker", "ESLint", "Prettier"];

const INITIAL_MESSAGES: Message[] = [
  { id: "1", user: "Alice", time: "10:28", text: "Hey, how's it going?" },
  { id: "2", user: "Bob", time: "10:30", text: "Pretty good! Just shipped the new feature." },
  { id: "3", user: "Alice", time: "10:32", text: "Nice! I'll review the PR now." },
  { id: "4", user: "Bob", time: "10:35", text: "Thanks, let me know if you need anything." },
  { id: "5", user: "Alice", time: "10:38", text: "Will do. Looks clean so far." },
  { id: "6", user: "Bob", time: "10:40", text: "I also added the tests we discussed." },
];

const NAMES = ["Alice", "Bob", "Charlie", "Diana"];
const REPLIES = ["Sounds good!", "Let me check.", "On it.", "Done!", "Will do.", "LGTM 👍", "Pushed a fix.", "Can you review?", "Merged to main.", "Deployed to staging."];

let nextMessageId = 7;

function setupXPanGesture(el: HTMLElement): () => void {
  let dragging = false;
  let startX = 0;
  let scrollStart = 0;

  const onDown = (e: MouseEvent | TouchEvent) => {
    if (dragging) return;
    const target = e.target as HTMLElement | null;
    if (target?.closest("button, a, input, textarea, [contenteditable]")) return;
    if ("touches" in e) e.preventDefault();

    dragging = true;
    const x = "touches" in e ? (e.touches[0]?.clientX ?? 0) : e.clientX;
    startX = x;
    scrollStart = el.scrollLeft;
    el.style.cursor = "grabbing";
    el.style.userSelect = "none";
  };

  const onMove = (e: MouseEvent | TouchEvent) => {
    if (!dragging) return;
    e.preventDefault();
    const x = "touches" in e ? (e.touches[0]?.clientX ?? 0) : e.clientX;
    el.scrollLeft = scrollStart + (startX - x);
  };

  const onUp = () => {
    if (!dragging) return;
    dragging = false;
    el.style.cursor = "";
    el.style.userSelect = "";
  };

  el.addEventListener("mousedown", onDown);
  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);
  el.addEventListener("touchstart", onDown, { passive: false });
  window.addEventListener("touchmove", onMove, { passive: false });
  window.addEventListener("touchend", onUp);

  return () => {
    el.removeEventListener("mousedown", onDown);
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
    el.removeEventListener("touchstart", onDown);
    window.removeEventListener("touchmove", onMove);
    window.removeEventListener("touchend", onUp);
  };
}

function useScrollFadeX<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [scrollPos, setScrollPos] = useState<"start" | "end" | "middle">("start");

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onScroll = () => {
      const atStart = el.scrollLeft <= 2;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;
      if (atStart) setScrollPos("start");
      else if (atEnd) setScrollPos("end");
      else setScrollPos("middle");
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const setRef = useCallback((el: T | null) => {
    ref.current = el;
    if (el) setupXPanGesture(el);
  }, []);

  return { setRef, scrollPos };
}

function addChatMessage(setMessages: React.Dispatch<React.SetStateAction<Message[]>>) {
  const user = NAMES[Math.floor(Math.random() * NAMES.length)];
  const text = REPLIES[Math.floor(Math.random() * REPLIES.length)];
  setMessages((prev) => [...prev, { id: String(nextMessageId++), user, time: "12:00", text }]);
}

function VerticalSwipeDemo() {
  const yPanRef = useYSwipeGesture<HTMLDivElement>();

  return (
    <div
      ref={yPanRef}
      className="scroll-fade-y border-border relative h-80 overflow-y-auto rounded-lg border"
    >
      <div className="flex flex-col">
        {SECTIONS.map((s, i) => (
          <section
            key={i}
            className={cn(
              "flex min-h-[80vh] flex-col items-center justify-center gap-4 bg-gradient-to-br p-8 text-center text-white",
              s.color,
            )}
          >
            <h3 className="text-2xl font-bold">{s.title}</h3>
            <p className="max-w-md text-sm text-white/80">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

function HorizontalTagsDemo() {
  const { setRef: xPanRef, scrollPos } = useScrollFadeX<HTMLDivElement>();

  return (
    <div
      ref={xPanRef}
      className={cn(
        "scroll-fade-x border-border flex h-14 cursor-grab items-center gap-2 overflow-x-auto rounded-lg border px-3",
        scrollPos === "start" && "scrolled-to-left",
        scrollPos === "end" && "scrolled-to-right",
      )}
    >
      {TAGS.map((tag) => (
        <span
          key={tag}
          className="bg-surface-hover text-fg hover:bg-surface shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

function ChatPaneDemo() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const { bottomRef, scrollToBottom, isAtBottom } = useAutoScroll(messages);

  return (
    <div className="border-border bg-surface relative flex flex-col rounded-lg border">
      <div
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
          className="hover:bg-surface-hover rounded-md px-3 py-1 text-xs text-fg transition-colors"
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

/**
 * Design decision: the ScrollArea component (Radix-based with styled scrollbar)
 * stays a styled overflow container. Gesture-driven scrolling (drag-pan, swipe)
 * is composed at the demo level to keep primitives lean.
 */
const examples: UIExample[] = [
  {
    id: "vertical-swipe",
    title: "Vertical Swipe",
    description:
      "Drag-to-scroll Y-pane using the useYSwipeGesture drag-pan pattern. No visible scrollbar.",
    render: () => <VerticalSwipeDemo />,
  },
  {
    id: "horizontal-tags",
    title: "Horizontal Tags",
    description:
      "Draggable X-axis tag strip with scroll-fade-x edge masking.",
    render: () => <HorizontalTagsDemo />,
  },
  {
    id: "chat-pane",
    title: "Chat Pane",
    description:
      "Auto-scrolling message list with jump-to-bottom button. Wheel/trackpad scrolling works via the global scrollbar-width: none approach.",
    render: () => <ChatPaneDemo />,
  },
];

export default function ScrollAreaPage() {
  return (
    <ExampleTabs
      title="Scroll Area"
      intro="Gesture-driven scroll demos. The ScrollArea component stays a styled overflow container — interaction is demo-level composition."
      examples={examples}
    />
  );
}
