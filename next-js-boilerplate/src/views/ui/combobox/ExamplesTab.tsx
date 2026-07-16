import { useState } from "react";
import { Combobox } from "@/components/ui/Combobox";
import { getLabel } from "./helpers";
import { languages } from "./data";

export function ExamplesTab() {
  const [language, setLanguage] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Language Selector</h3>
        <Combobox
          options={languages}
          value={language}
          onValueChange={setLanguage}
          className="max-w-sm"
        />
        {language && (
          <div className="bg-surface flex items-center justify-between rounded border border-border px-3 py-2">
            <span className="text-sm">
              Selected:{" "}
              <strong>{getLabel(language, languages)}</strong>
            </span>
            <button
              type="button"
              onClick={() => setLanguage("")}
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
