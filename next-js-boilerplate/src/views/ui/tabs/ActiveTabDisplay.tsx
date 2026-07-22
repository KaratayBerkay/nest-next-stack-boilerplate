"use client";

import { useTabsContext } from "@/components/ui/Tabs";

export function ActiveTabDisplay() {
  const { activeValue } = useTabsContext();
  return (
    <div className="bg-surface border-border flex items-center justify-between rounded border px-3 py-2">
      <span className="text-sm">
        Active tab: <strong>{activeValue}</strong>
      </span>
    </div>
  );
}
