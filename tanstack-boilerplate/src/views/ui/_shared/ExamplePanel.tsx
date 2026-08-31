"use client";

import { IconCode, IconEye } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { CodeBlock } from "./CodeBlock";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { ExamplePanelProps } from "@/types/views/ui/ExampleTabsShared-types";

export function ExamplePanel({
  example,
  baseId,
  viewMode,
  onToggleView,
}: ExamplePanelProps) {
  const t = useMessages("shared/example-tabs");
  return (
    <div
      id={`${baseId}-panel-${example.id}`}
      role="tabpanel"
      aria-labelledby={`${baseId}-tab-${example.id}`}
      className="space-y-4"
    >
      <p className="text-muted text-sm italic">{example.description}</p>
      {example.code && (
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={onToggleView}
          leftIcon={
            viewMode === "preview" ? (
              <IconCode size={14} />
            ) : (
              <IconEye size={14} />
            )
          }
        >
          {viewMode === "preview" ? t.viewCode : t.preview}
        </Button>
      )}
      {viewMode === "preview" ? (
        <div>{example.render()}</div>
      ) : example.code ? (
        <CodeBlock code={example.code} />
      ) : null}
    </div>
  );
}
