"use client";
import { useState, type Dispatch, type SetStateAction } from "react";
import { LogoSpinner } from "@/components/ui/LogoSpinner";
import { Button } from "@/components/ui/Button";

function handleRouteTransition(
  setNavigating: Dispatch<SetStateAction<boolean>>,
) {
  setNavigating(true);
  setTimeout(() => setNavigating(false), 2000);
}

export function RouteTransitionTab() {
  const [isNavigating, setNavigating] = useState(false);

  return (
    <div className="border-border bg-surface relative h-72 overflow-hidden rounded-lg border">
      <div className="flex h-full flex-col">
        <header className="border-border flex items-center gap-4 border-b px-4 py-2">
          <div className="bg-brand/20 size-3 rounded-full" />
          <div className="bg-surface-hover h-3 w-32 rounded" />
          <div className="bg-surface-hover h-3 w-20 rounded" />
        </header>
        <div className="flex flex-1 flex-col items-start gap-3 p-4">
          <div className="bg-surface-hover h-4 w-3/4 rounded" />
          <div className="bg-surface-hover h-4 w-1/2 rounded" />
          <Button
            variant="primary"
            onClick={() => handleRouteTransition(setNavigating)}
          >
            Navigate to /dashboard
          </Button>
        </div>
      </div>
      {isNavigating && (
        <div className="bg-bg/80 fixed inset-0 z-50 flex items-center justify-center">
          <LogoSpinner />
        </div>
      )}
    </div>
  );
}
