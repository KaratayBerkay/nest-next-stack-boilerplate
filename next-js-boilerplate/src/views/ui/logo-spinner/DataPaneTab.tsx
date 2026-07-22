"use client";
import { useState, type Dispatch, type SetStateAction } from "react";
import { LogoSpinner } from "@/components/ui/LogoSpinner";
import { Button } from "@/components/ui/Button";

const dataItems = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "Admin" },
  { id: 2, name: "Bob Smith", email: "bob@example.com", role: "Editor" },
  { id: 3, name: "Carol Davis", email: "carol@example.com", role: "Viewer" },
];

function handleLoadData(
  setPhase: Dispatch<
    SetStateAction<"idle" | "skeleton" | "spinner" | "loaded">
  >,
) {
  setPhase("skeleton");
  setTimeout(() => setPhase("spinner"), 1500);
  setTimeout(() => setPhase("loaded"), 2500);
}

export function DataPaneTab() {
  const [phase, setPhase] = useState<
    "idle" | "skeleton" | "spinner" | "loaded"
  >("idle");

  return (
    <div className="border-border bg-surface relative h-72 overflow-hidden rounded-lg border">
      {phase === "idle" && (
        <div className="flex h-full items-center justify-center">
          <Button variant="primary" onClick={() => handleLoadData(setPhase)}>
            Load Data
          </Button>
        </div>
      )}
      {phase === "skeleton" && (
        <div className="flex h-full flex-col gap-3 p-4">
          <div className="bg-surface-hover h-4 w-3/4 animate-pulse rounded" />
          <div className="bg-surface-hover h-4 w-1/2 animate-pulse rounded" />
          <div className="bg-surface-hover h-4 w-2/3 animate-pulse rounded" />
        </div>
      )}
      {phase === "spinner" && (
        <div className="flex h-full items-center justify-center">
          <LogoSpinner className="!min-h-0" />
        </div>
      )}
      {phase === "loaded" && (
        <div className="flex h-full flex-col gap-2 overflow-y-auto p-4">
          {dataItems.map((item) => (
            <div
              key={item.id}
              className="border-border bg-surface-hover flex items-center gap-4 rounded-md border p-3"
            >
              <div className="bg-brand/20 flex size-10 items-center justify-center rounded-full">
                <span className="text-brand text-sm font-medium">
                  {item.name.charAt(0)}
                </span>
              </div>
              <div className="flex flex-1 flex-col">
                <span className="text-sm font-medium">{item.name}</span>
                <span className="text-text-secondary text-xs">
                  {item.email}
                </span>
              </div>
              <span className="text-text-secondary text-xs">{item.role}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
