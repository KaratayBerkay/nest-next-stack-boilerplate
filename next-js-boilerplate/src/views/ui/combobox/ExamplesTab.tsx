import { useState } from "react";
import { Combobox } from "@/components/ui/Combobox";
import { getLabel } from "./helpers";
import { countries } from "./data";

export function ExamplesTab() {
  const [country, setCountry] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Country Search</h3>
        <Combobox
          options={countries}
          value={country}
          onValueChange={(val) => setCountry(val as string)}
          placeholder="Select your country..."
          searchPlaceholder="Search countries..."
          className="max-w-sm"
        />
        {country && (
          <div className="bg-surface flex items-center justify-between rounded border border-border px-3 py-2">
            <span className="text-sm">
              Selected:{" "}
              <strong>{getLabel(country, countries)}</strong>
            </span>
            <button
              type="button"
              onClick={() => setCountry("")}
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
