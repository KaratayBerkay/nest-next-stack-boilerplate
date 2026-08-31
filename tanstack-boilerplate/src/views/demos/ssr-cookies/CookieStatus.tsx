"use client";

import { useEffect, useState } from "react";

export function CookieStatus() {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const hasToken = document.cookie.includes("access_token=");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuthenticated(hasToken);
  }, []);

  return (
    <div
      className="flex flex-col gap-1 rounded border p-3 text-sm"
      data-testid="ssr-cookie-status"
    >
      {authenticated ? (
        <span className="text-green-600">
          Authenticated (access token present)
        </span>
      ) : (
        <span className="text-zinc-500">Not authenticated</span>
      )}
    </div>
  );
}
