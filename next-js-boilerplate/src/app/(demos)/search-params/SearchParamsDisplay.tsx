"use client";

import { useSearchParams } from "next/navigation";

export function SearchParamsDisplay() {
  const params = useSearchParams();
  const name = params?.get("name") ?? "unknown";
  const category = params?.get("category") ?? "none";

  return (
    <div
      data-testid="client-params"
      className="border-border rounded border p-3 text-sm"
    >
      <span className="font-semibold">Client (useSearchParams):</span> name=
      {name}, category={category}
    </div>
  );
}
