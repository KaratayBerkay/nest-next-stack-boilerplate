"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { LogoSpinner } from "@/components/ui/LogoSpinner";
import { Button } from "@/components/ui/Button";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const dataItems = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "Admin" },
  { id: 2, name: "Bob Smith", email: "bob@example.com", role: "Editor" },
  { id: 3, name: "Carol Davis", email: "carol@example.com", role: "Viewer" },
];

function handleRouteTransition(
  setNavigating: Dispatch<SetStateAction<boolean>>,
) {
  setNavigating(true);
  setTimeout(() => setNavigating(false), 2000);
}

function handleLoadData(
  setPhase: Dispatch<
    SetStateAction<"idle" | "skeleton" | "spinner" | "loaded">
  >,
) {
  setPhase("skeleton");
  setTimeout(() => setPhase("spinner"), 1500);
  setTimeout(() => setPhase("loaded"), 2500);
}

function handleShowSplash(
  setSplashState: Dispatch<
    SetStateAction<"idle" | "showing" | "fading">
  >,
) {
  setSplashState("showing");
  setTimeout(() => setSplashState("fading"), 2000);
  setTimeout(() => setSplashState("idle"), 2500);
}

function handleDismissSplash(
  setSplashState: Dispatch<
    SetStateAction<"idle" | "showing" | "fading">
  >,
) {
  setSplashState("fading");
  setTimeout(() => setSplashState("idle"), 500);
}

function RouteTransitionTab() {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80">
          <LogoSpinner />
        </div>
      )}
    </div>
  );
}

function DataPaneTab() {
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

function SplashTab() {
  const [splashState, setSplashState] = useState<
    "idle" | "showing" | "fading"
  >("idle");

  return (
    <div className="border-border bg-surface relative h-72 overflow-hidden rounded-lg border">
      {splashState === "idle" && (
        <div className="flex h-full items-center justify-center">
          <Button
            variant="primary"
            onClick={() => handleShowSplash(setSplashState)}
          >
            Show Splash
          </Button>
        </div>
      )}
      {splashState !== "idle" && (
        <div
          className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-bg transition-opacity duration-700"
          style={{
            opacity: splashState === "showing" ? 1 : 0,
          }}
        >
          <LogoSpinner className="!min-h-0" />
          <Button
            variant="ghost"
            onClick={() => handleDismissSplash(setSplashState)}
          >
            Dismiss
          </Button>
        </div>
      )}
    </div>
  );
}

const examples: UIExample[] = [
  {
    id: "route-transition",
    title: "Route Transition",
    description:
      "Mock page shell that swaps content behind a centered LogoSpinner overlay on button click.",
    render: () => <RouteTransitionTab />,
  },
  {
    id: "data-pane",
    title: "Data Pane",
    description:
      "Skeleton rows → LogoSpinner → loaded list sequence.",
    render: () => <DataPaneTab />,
  },
  {
    id: "splash",
    title: "Splash",
    description: "Full-pane brand splash with fade-out.",
    render: () => <SplashTab />,
  },
];

export default function LogoSpinnerPage({ initialTab }: { initialTab?: string }) {
  return (
    <ExampleTabs
      title="Logo Spinner"
      intro="A full-page loading spinner with brand logo."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
