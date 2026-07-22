"use client";

import { useEffect, useState } from "react";
import { getDataServer, type ApiData } from "@/api/server/data";

export function DataTable() {
  const [data, setData] = useState<ApiData | null>(null);

  useEffect(() => {
    getDataServer()
      .then(setData)
      .catch(() => setData(null));
  }, []);

  if (!data) return null;

  return (
    <div
      className="flex flex-col gap-1 rounded border p-3 text-sm"
      data-testid="server-data"
    >
      <span>
        id: <span className="font-mono">{data.id}</span>
      </span>
      <span data-testid="data-name">
        name: <span className="font-mono">{data.name}</span>
      </span>
      <span>
        nested.value: <span className="font-mono">{data.nested.value}</span>
      </span>
    </div>
  );
}
