"use client";

import { useEffect, useState } from "react";
import { getNonceServer } from "@/api/server/security/nonce";

export function NoncePanel() {
  const [nonce, setNonce] = useState<string | null>(null);

  useEffect(() => {
    getNonceServer()
      .then((data) => setNonce(data.nonce ?? null))
      .catch(() => setNonce(null));
  }, []);

  return (
    <div
      className="flex flex-col gap-1 rounded border p-3 text-sm"
      data-testid="csp-nonce-panel"
    >
      <span className="text-muted">
        Per-request nonce (from the <code className="text-brand">x-nonce</code>{" "}
        request header set by <code className="text-brand">proxy.ts</code>):
      </span>
      <span className="font-mono break-all" data-testid="csp-nonce">
        {nonce ?? "(none)"}
      </span>
    </div>
  );
}
