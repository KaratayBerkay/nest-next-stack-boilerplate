import type { Metadata } from "next";
import { Suspense } from "react";
import { ForgotPasswordContent } from "@/views/auth/forgot-password/PageContent";
import { PulseBlockFallback } from "@/fallbacks";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your password",
};

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<PulseBlockFallback />}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
