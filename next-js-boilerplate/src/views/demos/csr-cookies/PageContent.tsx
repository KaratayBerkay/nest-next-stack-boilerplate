"use client";

import { useEffect, useState } from "react";
import { getMeRawServer } from "@/api/server/auth/me-raw";

export default function CsrCookiesPage() {
  const [session, setSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMeRawServer()
      .then((data) => {
        setSession(data.authed ? data.session ?? null : null);
        setLoading(false);
      })
      .catch(() => {
        setSession(null);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-brand text-sm font-semibold">CSR Cookies</h2>
      <p className="text-muted text-sm">
        This page cannot read the httpOnly cookie in JavaScript. It calls{" "}
        <code className="text-brand">/api/auth/me</code> which reads the cookie
        server-side.
      </p>
      <div className="flex flex-col gap-1 rounded border p-3 text-sm">
        {loading ? (
          <span className="text-zinc-500" data-testid="csr-cookie-loading">
            Checking authentication...
          </span>
        ) : (
          <span
            className={session ? "text-green-600" : "text-zinc-500"}
            data-testid="csr-cookie-status"
          >
            {session
              ? `Authenticated: ${session.slice(0, 20)}...`
              : "Not authenticated"}
          </span>
        )}
      </div>
    </div>
  );
}
