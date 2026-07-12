"use client";

import type { HeavyComponentProps } from "@/types/demos/HeavyComponent-types";

export default function HeavyComponent({ message }: HeavyComponentProps) {
  // Simulate a heavy component that is code-split.
  return (
    <div
      className="rounded border border-purple-300 p-3 text-sm"
      data-testid="lazy-component"
    >
      <span className="font-semibold text-purple-600">Lazy loaded:</span>{" "}
      {message}
    </div>
  );
}
