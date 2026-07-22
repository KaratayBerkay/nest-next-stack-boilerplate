"use client";

import { useEffect, useState } from "react";
import { echoServer, type EchoResponse } from "@/api/server/echo";

export default function CsrPage() {
  const [data, setData] = useState<EchoResponse | null>(null);

  useEffect(() => {
    echoServer("CSR").then(setData);
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-brand text-sm font-semibold">
        Client-Side Rendering
      </h2>
      {data ? (
        <>
          <p className="text-muted text-sm" data-testid="csr-data">
            Server says: <span className="font-mono">{data.hello}</span>
          </p>
          <p className="text-xs text-zinc-500">
            This data was fetched <strong>after</strong> hydration — it was NOT
            in the initial HTML.
          </p>
        </>
      ) : (
        <p className="text-sm text-zinc-500" data-testid="csr-loading">
          Loading...
        </p>
      )}
    </div>
  );
}
