"use client";

import { GlobalErrorPage } from "@/features/statics";
import type { GlobalErrorProps } from "@/types/app/GlobalError-types";

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return <GlobalErrorPage error={error} reset={reset} />;
}
