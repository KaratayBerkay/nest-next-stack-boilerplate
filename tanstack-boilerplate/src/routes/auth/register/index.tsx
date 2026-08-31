// Ported from next-js-boilerplate/src/app/auth/register/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import { Suspense } from "react";
import { RegisterForm } from "@/features/auth/ui/register-form";
import { SocialLoginButtons } from "@/features/auth/ui/social-login-buttons";
import { PulseBlockFallback, PulseSmallBlockFallback } from "@/fallbacks";

export const metadata: Metadata = {
  title: "Register",
  description: "Create a new account",
};

export const Route = createFileRoute("/auth/register/")({
  head: () => metadataToHead(metadata),
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<PulseBlockFallback />}>
        <RegisterForm />
      </Suspense>
      <Suspense fallback={<PulseSmallBlockFallback />}>
        <SocialLoginButtons />
      </Suspense>
    </div>
  );
}
