"use client";

import { useEffect } from "react";
import { ErrorPage } from "@/features/statics";
import type { V1ErrorProps } from "@/types/v1/V1Error-types";

export default function V1Error({ error, reset }: V1ErrorProps) {
  useEffect(() => {
    console.error("[v1] segment error:", error);
  }, [error]);

  return (
    <div data-testid="error-boundary" className="surface flex flex-col gap-2 p-5">
      <ErrorPage error={error} reset={reset} />
    </div>
  );
}
