import { useState } from "react";
import { Combobox } from "@/components/ui/Combobox";
import { getLabel } from "./helpers";
import { frameworks } from "./data";

export function ComponentsTab() {
  const [framework, setFramework] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Default</h3>
        <Combobox
          options={frameworks}
          value={framework}
          onValueChange={setFramework}
          className="max-w-sm"
        />
        {framework && (
          <div className="bg-surface flex items-center justify-between rounded border border-border px-3 py-2">
            <span className="text-sm">
              Selected: <strong>{getLabel(framework, frameworks)}</strong>
            </span>
            <button
              type="button"
              onClick={() => setFramework("")}
              className="text-muted hover:text-fg p-0.5"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
