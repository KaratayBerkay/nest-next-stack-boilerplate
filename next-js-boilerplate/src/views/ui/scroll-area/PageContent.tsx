"use client";

import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";
import { VerticalSwipeDemo } from "@/views/ui/scroll-area/VerticalSwipeDemo";
import { HorizontalTagsDemo } from "@/views/ui/scroll-area/HorizontalTagsDemo";
import { ChatPaneDemo } from "@/views/ui/scroll-area/ChatPaneDemo";

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
    description: "Draggable X-axis tag strip with scroll-fade-x edge masking.",
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

export default function ScrollAreaPage({
  initialTab,
}: {
  initialTab?: string;
}) {
  return (
    <ExampleTabs
      title="Scroll Area"
      intro="Gesture-driven scroll demos. The ScrollArea component stays a styled overflow container — interaction is demo-level composition."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
