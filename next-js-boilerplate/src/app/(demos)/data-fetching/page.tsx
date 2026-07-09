import type { Metadata } from "next";
import { Suspense } from "react";
import { DataTable } from "./DataTable";
import { LoadingTextFallback } from "@/fallbacks";

export const metadata: Metadata = {
  title: "Data Fetching",
  description: "Data fetching patterns",
};

export default function DataFetchingPage() {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-brand text-sm font-semibold">Server Data Fetching</h2>
      <p className="text-muted text-sm">
        This data was fetched from a Route Handler inside a React Server
        Component using <code className="text-brand">fetch</code>.
      </p>
      <Suspense fallback={<LoadingTextFallback text="Loading data..." />}>
        <DataTable />
      </Suspense>
    </div>
  );
}
