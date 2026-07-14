"use client";

import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

function BombButton() {
  return (
    <button
      onClick={() => {
        throw new Error("Boom!");
      }}
      className="rounded-lg bg-error px-3 py-1.5 text-sm font-medium text-error-fg hover:opacity-90"
    >
      Throw Error
    </button>
  );
}

const examples: UIExample[] = [
  {
    id: "throw-bomb",
    title: "Throw Bomb",
    description: "Button that throws an error on click, showing the boundary fallback.",
    render: () => (
      <div className="border-border bg-surface rounded-lg border p-4">
        <ErrorBoundary>
          <BombButton />
        </ErrorBoundary>
      </div>
    ),
  },
  {
    id: "custom-fallback",
    title: "Custom Fallback",
    description: "Error boundary with a custom fallback UI.",
    render: () => (
      <div className="border-border bg-surface rounded-lg border p-4">
        <ErrorBoundary
          fallback={
            <div className="flex flex-col items-center gap-2 py-6">
              <p className="text-fg text-sm font-medium">Custom Error</p>
              <p className="text-muted text-xs">Something broke, but we handled it gracefully.</p>
            </div>
          }
        >
          <BombButton />
        </ErrorBoundary>
      </div>
    ),
  },
];

export default function ErrorBoundaryPage() {
  return (
    <ExampleTabs
      title="Error Boundary"
      intro="Catches errors in child components and displays a fallback UI."
      examples={examples}
    />
  );
}
