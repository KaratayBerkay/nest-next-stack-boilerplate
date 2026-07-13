"use client";

import { useState } from "react";
import {
  Skeleton,
  SkeletonLine,
  SkeletonMessage,
  SkeletonFeedList,
  SkeletonConversationSidebar,
} from "@/components/ui/Skeleton";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

function ComponentsTab() {
  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Base Skeleton</h3>
        <Skeleton className="h-4 w-64" data-testid="skeleton-text" />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Circle</h3>
        <Skeleton
          className="size-10 rounded-full"
          data-testid="skeleton-circle"
        />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Skeleton Line</h3>
        <div className="flex flex-col gap-2">
          <SkeletonLine width="60%" data-testid="skeleton-line-60" />
          <SkeletonLine width="40%" data-testid="skeleton-line-40" />
          <SkeletonLine width="80%" data-testid="skeleton-line-80" />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Skeleton Message</h3>
        <SkeletonMessage data-testid="skeleton-message" />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Skeleton Feed List</h3>
        <SkeletonFeedList data-testid="skeleton-feed" />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">
          Skeleton Conversation Sidebar
        </h3>
        <SkeletonConversationSidebar
          className="max-w-sm"
          data-testid="skeleton-sidebar"
        />
      </section>
    </div>
  );
}

function ExamplesTab({ loading, setLoading }: { loading: boolean; setLoading: React.Dispatch<React.SetStateAction<boolean>> }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-lg font-semibold">Profile Card Loading</h3>
      <p className="text-muted mb-2 text-xs">
        Toggle loading state to see skeletons in a realistic layout.
      </p>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setLoading((p) => !p)}
        className="mb-3 w-fit"
      >
        {loading ? "Show Loaded" : "Show Loading"}
      </Button>
      <div className="surface max-w-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center gap-3 p-4">
            <Skeleton className="size-12 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4">
            <Avatar
              src="https://i.pravatar.cc/80?img=12"
              alt="User"
              fallback="JD"
              size="md"
            />
            <div>
              <p className="text-sm font-medium">Jane Doe</p>
              <p className="text-muted text-xs">jane@example.com</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default function SkeletonPage() {
  const [loading, setLoading] = useState(true);

  const examples: UIExample[] = [
    {
      id: "components",
      title: "Feed Placeholder",
      description: "Skeleton preset mimicking a feed with avatar and lines.",
      render: () => <ComponentsTab />,
    },
    {
      id: "examples",
      title: "Card Placeholder",
      description: "Skeleton preset for a card layout.",
      render: () => <ExamplesTab loading={loading} setLoading={setLoading} />,
    },
  ];

  return (
    <ExampleTabs
      title="Skeleton"
      intro="A loading placeholder for content that has not loaded yet."
      examples={examples}
    />
  );
}
