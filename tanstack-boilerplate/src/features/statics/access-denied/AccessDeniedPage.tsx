"use client";

import type { AccessDeniedPageProps } from "@/types/features/statics/AccessDeniedPage-types";

export function AccessDeniedPage({
  title = "Access denied",
  message = "You do not have permission to access this page.",
}: AccessDeniedPageProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-brand text-sm font-semibold">{title}</h2>
      <p className="text-muted text-sm">{message}</p>
    </div>
  );
}
