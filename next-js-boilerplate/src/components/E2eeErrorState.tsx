"use client";

import { IconAlertTriangle } from "@tabler/icons-react";
import { Button } from "@/components/ui/button/button";
import type { E2eeErrorStateProps } from "@/types/components/E2eeErrorState-types";

export function E2eeErrorState({ error, onRetry }: E2eeErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <IconAlertTriangle className="text-destructive h-10 w-10" />
      <p className="text-sm text-zinc-400">{error}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}
