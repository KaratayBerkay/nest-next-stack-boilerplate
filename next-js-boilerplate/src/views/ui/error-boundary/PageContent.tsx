"use client";

import { useState } from "react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { useToast } from "@/components/ui/Toast";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

function Bomb({ label = "Throw Error" }: { label?: string }) {
  const [shouldThrow, setShouldThrow] = useState(false);
  if (shouldThrow) {
    throw new Error("Boom!");
  }
  return (
    <button
      onClick={() => setShouldThrow(true)}
      className="rounded-lg bg-error px-3 py-1.5 text-sm font-medium text-error-fg hover:opacity-90"
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
          toast({ title: "Fetch failed", description: "Server returned 500", variant: "destructive" });
        }}
        className="rounded-lg bg-error px-3 py-1.5 text-sm font-medium text-error-fg hover:opacity-90"
      >
        Fail Request
      </button>
      <div className="border-border/50 bg-bg rounded-md border p-3 text-xs text-fg">
        <span className="font-semibold">ⓘ </span>
        Async errors must be caught in the handler and surfaced via toast or inline alert — boundaries only catch render-phase exceptions.
      </div>
    </div>
  );
}

const examples: UIExample[] = [
  {
    id: "render-throw",
    title: "Render Throw",
    description: "Clicking the button triggers a re-render that throws — caught by the boundary, with a reset button to recover.",
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
          fallback={
            <div className="flex flex-col items-center gap-3 py-6">
              <p className="text-fg text-sm font-medium">Custom Error</p>
              <p className="text-muted text-xs">Something broke, but we handled it gracefully.</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-surface hover:bg-surface-hover rounded-md px-3 py-1 text-xs transition-colors"
              >
                Retry
              </button>
            </div>
          }
        >
          <Bomb label="Throw (Custom)" />
        </ErrorBoundary>
      </div>
    ),
  },
  {
    id: "async-fetch",
    title: "Async / Fetch",
    description: "Boundaries don't catch async errors. Handle them explicitly with a toast + alert.",
    render: () => (
      <div className="border-border bg-surface rounded-lg border p-4">
        <AsyncFailureDemo />
      </div>
    ),
  },
];

export default function ErrorBoundaryPage({ initialTab }: { initialTab?: string }) {
  return (
    <ExampleTabs
      title="Error Boundary"
      intro="Catches errors in child components and displays a fallback UI."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
