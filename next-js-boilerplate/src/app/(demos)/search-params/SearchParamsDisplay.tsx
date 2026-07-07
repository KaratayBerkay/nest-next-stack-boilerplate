"use client";

import { useClientSearchParams } from "@/hooks/useClientSearchParams";

export function SearchParamsDisplay() {
  const params = useClientSearchParams();
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
