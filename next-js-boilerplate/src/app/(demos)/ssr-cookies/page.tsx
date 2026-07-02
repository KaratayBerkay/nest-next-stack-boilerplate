import { cookies } from "next/headers";
import { Suspense } from "react";
import { AuthStatus } from "@/features/auth/ui/AuthStatus";

async function CookieStatus() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  return (
    <div
      className="flex flex-col gap-1 rounded border p-3 text-sm"
      data-testid="ssr-cookie-status"
    >
      {accessToken ? (
        <span className="text-green-600">
          Authenticated (access token present)
        </span>
      ) : (
        <span className="text-zinc-500">Not authenticated</span>
      )}
    </div>
  );
}

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
