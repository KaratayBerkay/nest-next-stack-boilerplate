import { headers } from "next/headers";
import { Suspense } from "react";

interface ApiData {
  id: number;
  name: string;
  nested: { value: number };
}

async function fetchData(): Promise<ApiData> {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3100";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const res = await fetch(`${protocol}://${host}/api/data`, {
    cache: "no-store",
  });
  return res.json() as Promise<ApiData>;
}

async function DataTable() {
  const data = await fetchData();
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

export default function DataFetchingPage() {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-brand text-sm font-semibold">Server Data Fetching</h2>
      <p className="text-muted text-sm">
        This data was fetched from a Route Handler inside a React Server
        Component using <code className="text-brand">fetch</code>.
      </p>
      <Suspense
        fallback={
          <div className="rounded border p-3 text-sm text-zinc-400">
            Loading data...
          </div>
        }
      >
        <DataTable />
      </Suspense>
    </div>
  );
}
