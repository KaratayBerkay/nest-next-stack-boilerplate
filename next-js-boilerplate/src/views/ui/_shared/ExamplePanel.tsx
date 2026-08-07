"use client";

import { IconCode, IconEye } from "@tabler/icons-react";
import { CodeBlock } from "./CodeBlock";
import type { ExamplePanelProps } from "@/types/views/ui/ExampleTabsShared-types";

export function ExamplePanel({
  example,
  baseId,
  viewMode,
  onToggleView,
}: ExamplePanelProps) {
  return (
    <div
      id={`${baseId}-panel-${example.id}`}
      role="tabpanel"
      aria-labelledby={`${baseId}-tab-${example.id}`}
      className="space-y-4"
    >
      <p className="text-muted text-sm italic">{example.description}</p>
      {example.code && (
        <button
          type="button"
          onClick={onToggleView}
          className="text-muted hover:text-fg flex items-center gap-1.5 text-xs font-medium transition-colors"
        >
          {viewMode === "preview" ? (
            <>
              <IconCode size={14} /> View Code
            </>
          ) : (
            <>
              <IconEye size={14} /> Preview
            </>
          )}
        </button>
      )}
      {viewMode === "preview" ? (
        <div>{example.render()}</div>
      ) : example.code ? (
        <CodeBlock code={example.code} />
      ) : null}
    </div>
  );
}
