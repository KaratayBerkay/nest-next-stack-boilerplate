import type { Metadata } from "next";
import { Suspense } from "react";
import { UndoPasswordChangeForm } from "@/features/auth/ui/undo-password-change-form";
import { PulseBlockFallback } from "@/fallbacks";
import type { UndoPasswordChangePageProps } from "@/types/auth/UndoPasswordChangePage-types";

export const metadata: Metadata = {
  title: "Undo Password Change",
  description: "Restore your previous password",
};

export default async function UndoPasswordChangePage({
  searchParams,
}: UndoPasswordChangePageProps) {
  const sp = await searchParams;
  const token = (sp.token as string) ?? "";

  return (
    <Suspense fallback={<PulseBlockFallback />}>
      <UndoPasswordChangeForm token={token} />
    </Suspense>
  );
}
