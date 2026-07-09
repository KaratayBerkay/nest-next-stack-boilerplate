"use client";

import { ErrorPage } from "@/features/statics";
import type { BoomErrorProps } from "@/types/routing/BoomError-types";

export default function BoomError({
  error,
  reset,
}: BoomErrorProps) {
  return (
    <div
      data-testid="error-boundary"
      className="surface flex flex-col gap-2 p-5"
    >
      <ErrorPage error={error} reset={reset} />
    </div>
  );
}
