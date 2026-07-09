import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthStatus } from "@/features/auth/ui/AuthStatus";
import { CookieStatus } from "./CookieStatus";

export const metadata: Metadata = {
  title: "SSR Cookies",
  description: "Server-side rendering with cookies",
};

export default function SsrCookiesPage() {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-brand text-sm font-semibold">SSR Authentication</h2>
      <p className="text-muted text-sm">
        This page reads the <code className="text-brand">access_token</code>{" "}
        cookie on the <strong>server</strong> using{" "}
        <code className="text-brand">cookies()</code>.
      </p>
      <Suspense
        fallback={
          <div className="rounded border p-3 text-sm text-zinc-400">
            Checking cookie...
          </div>
        }
      >
        <CookieStatus />
      </Suspense>
      <div className="mt-2">
        <AuthStatus />
      </div>
    </div>
  );
}
