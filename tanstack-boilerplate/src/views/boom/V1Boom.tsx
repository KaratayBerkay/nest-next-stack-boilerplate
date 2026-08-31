"use client";

import { useState } from "react";

// Throws during render once the button is clicked, so the nearest error.tsx
// boundary (v1/[lang]/error.tsx) catches it. A render-time throw — not an
// event-handler throw — is what React error boundaries actually catch.
export function V1Boom() {
  const [explode, setExplode] = useState(false);
  if (explode) {
    throw new Error("Boom! A v1 component error was thrown.");
  }
  return (
    <button
      type="button"
      data-testid="trigger-error"
      className="text-brand underline"
      onClick={() => setExplode(true)}
    >
      Trigger error
    </button>
  );
}
