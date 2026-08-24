"use client";

import { ErrorPage } from "@/features/statics";
import type { RtcErrorProps } from "@/types/rtc/RtcError-types";

export default function RtcError({ error, reset }: RtcErrorProps) {
  return <ErrorPage error={error} reset={reset} />;
}
