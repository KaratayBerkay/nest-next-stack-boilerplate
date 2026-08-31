// Ported from next-js-boilerplate/src/app/auth/login/page.tsx
import { Suspense } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import type { Metadata } from "next";
import { createServerFn } from "@tanstack/react-start";
import { LoginForm } from "@/features/auth/ui/login-form";
import { SocialLoginButtons } from "@/features/auth/ui/social-login-buttons";
import { PulseBlockFallback, PulseSmallBlockFallback } from "@/fallbacks";
import { metadataToHead } from "@/lib/head";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your account",
};

const redirectIfAuthed = createServerFn().handler(async () => {
  const [{ getSessionUser }, { getBasePath }] = await Promise.all([
    import("@/lib/auth-ssr"),
    import("@/lib/get-base-path"),
  ]);
  const user = await getSessionUser();
  if (user) {
    throw redirect({ href: `${await getBasePath()}/feed` });
  }
  return null;
});

export const Route = createFileRoute("/auth/login/")({
  loader: () => redirectIfAuthed(),
  head: () => metadataToHead(metadata),
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<PulseBlockFallback />}>
        <LoginForm />
      </Suspense>
      <Suspense fallback={<PulseSmallBlockFallback />}>
        <SocialLoginButtons />
      </Suspense>
    </div>
  );
}
