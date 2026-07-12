"use client";

import { ErrorPage } from "@/features/statics";
import type { MessagesErrorProps } from "@/types/messages/MessagesError-types";

export default function MessagesError({ error, reset }: MessagesErrorProps) {
  return <ErrorPage error={error} reset={reset} />;
}
