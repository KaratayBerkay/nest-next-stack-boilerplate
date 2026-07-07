"use client";

import { useState } from "react";

/**
 * A button whose click count lives in React state.
 *
 * Used to prove how the App Router treats layouts vs pages on navigation: a
 * layout *persists* (its count survives navigation between sibling pages),
 * while a page subtree is torn down and recreated (its count starts fresh).
 * The count starts at 0 on both server and client, so there's no hydration
 * concern.
 */
export function Counter({ label }: { label: string }) {
  const [count, setCount] = useState(0);
  return (
    <button
      type="button"
      data-testid={`counter-${label}`}
      onClick={() => setCount((c) => c + 1)}
      className="text-brand underline"
    >
      {label}: clicked {count} times
    </button>
  );
}
