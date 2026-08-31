"use client";
import { useState } from "react";
import { Toggle } from "@/components/ui/Toggle";

export function FormattingToolbarTab() {
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Default</h3>
        <div className="flex gap-2">
          <Toggle pressed={bold} onPressedChange={setBold}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
              <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
            </svg>
            Bold
          </Toggle>
          <Toggle pressed={italic} onPressedChange={setItalic}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="19" x2="10" y1="4" y2="4" />
              <line x1="14" x2="5" y1="20" y2="20" />
              <line x1="15" x2="9" y1="4" y2="20" />
            </svg>
            Italic
          </Toggle>
        </div>
        <div className="bg-surface border-border flex items-center justify-between rounded border px-3 py-2">
          <span className="text-sm">
            Active:{" "}
            <strong>
              {[bold && "Bold", italic && "Italic"]
                .filter(Boolean)
                .join(", ") || "None"}
            </strong>
          </span>
          <button
            type="button"
            onClick={() => {
              setBold(false);
              setItalic(false);
            }}
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
      </section>
    </div>
  );
}
