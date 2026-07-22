"use client";

import { useState } from "react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { useToast } from "@/components/ui/Toast";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { ErrorBoundaryCustomFallback } from "@/fallbacks/views/error-boundary/ErrorBoundaryCustomFallback";
import type { UIExample } from "@/types/ui/ExampleTabs-types";
import type { BombProps } from "@/types/ui/Bomb-types";
import type { InitialTabProps } from "@/types/ui/PageContent-types";

function Bomb({ label = "Throw Error" }: BombProps) {
  const [shouldThrow, setShouldThrow] = useState(false);
  if (shouldThrow) {
    throw new Error("Boom!");
  }
  return (
    <button
      onClick={() => setShouldThrow(true)}
      className="bg-error text-error-fg rounded-lg px-3 py-1.5 text-sm font-medium hover:opacity-90"
    >
      {label}
    </button>
  );
}

function AsyncFailureDemo() {
  const { toast } = useToast();
  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted text-xs">Click to simulate a failed API call:</p>
      <button
        onClick={() => {
          toast({
            title: "Fetch failed",
            description: "Server returned 500",
            variant: "destructive",
          });
        }}
        className="bg-error text-error-fg rounded-lg px-3 py-1.5 text-sm font-medium hover:opacity-90"
      >
        Fail Request
      </button>
      <div className="border-border/50 bg-bg text-fg rounded-md border p-3 text-xs">
        <span className="font-semibold">ⓘ </span>
        Async errors must be caught in the handler and surfaced via toast or
        inline alert — boundaries only catch render-phase exceptions.
      </div>
    </div>
  );
}

const examples: UIExample[] = [
  {
    id: "render-throw",
    title: "Render Throw",
    description:
      "Clicking the button triggers a re-render that throws — caught by the boundary, with a reset button to recover.",
    render: () => (
      <div className="border-border bg-surface rounded-lg border p-4">
        <ErrorBoundary>
          <Bomb />
        </ErrorBoundary>
      </div>
    ),
  },
  {
    id: "custom-fallback",
    title: "Custom Fallback",
    description: "Error boundary with a branded fallback and retry button.",
    render: () => (
      <div className="border-border bg-surface rounded-lg border p-4">
        <ErrorBoundary
          fallback={<ErrorBoundaryCustomFallback />}
        >
          <Bomb label="Throw (Custom)" />
        </ErrorBoundary>
      </div>
    ),
  },
  {
    id: "async-fetch",
    title: "Async / Fetch",
    description:
      "Boundaries don't catch async errors. Handle them explicitly with a toast + alert.",
    render: () => (
      <div className="border-border bg-surface rounded-lg border p-4">
        <AsyncFailureDemo />
      </div>
    ),
  },
];

export default function ErrorBoundaryPage({
  initialTab,
}: InitialTabProps) {
  return (
    <ExampleTabs
      title="Error Boundary"
      intro="Catches errors in child components and displays a fallback UI."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
