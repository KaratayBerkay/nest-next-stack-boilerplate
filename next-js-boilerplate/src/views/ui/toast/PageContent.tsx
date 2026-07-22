"use client";

import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { VariantBasicsContent } from "@/views/ui/toast/VariantBasicsContent";
import { UndoableActionContent } from "@/views/ui/toast/UndoableActionContent";
import { StickyErrorContent } from "@/views/ui/toast/StickyErrorContent";
import { HoverPauseContent } from "@/views/ui/toast/HoverPauseContent";
import { NotificationCenterContent } from "@/views/ui/toast/NotificationCenterContent";
import { ToastGalleryContent } from "@/views/ui/toast/ToastGalleryContent";
import type { UIExample } from "@/types/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/ui/PageContent-types";

const examples: UIExample[] = [
  {
    id: "toast-examples",
    title: "Toast Examples",
    description:
      "Basic toast variants, undo actions, sticky errors, and hover pause.",
    render: () => (
      <div className="flex flex-col gap-8">
        <VariantBasicsContent />
        <UndoableActionContent />
        <StickyErrorContent />
        <HoverPauseContent />
      </div>
    ),
  },
  {
    id: "notification-center",
    title: "Notification Center",
    description:
      "Inbox-style notification list with avatars, timestamps, and unread badges.",
    render: () => <NotificationCenterContent />,
  },
  {
    id: "gallery",
    title: "Variant Gallery",
    description: "Toast variants displayed across theme variants.",
    render: () => <ToastGalleryContent />,
  },
];

export default function Page({ initialTab }: InitialTabProps) {
  return (
    <div data-testid="toast-demo">
      <ExampleTabs
        title="Toast"
        intro="A notification toast with different variants and auto-dismiss."
        examples={examples}
        initialTab={initialTab}
      />
    </div>
  );
}
