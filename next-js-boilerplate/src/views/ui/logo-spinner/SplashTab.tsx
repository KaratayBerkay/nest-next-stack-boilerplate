"use client";
import { useState, type Dispatch, type SetStateAction } from "react";
import { LogoSpinner } from "@/components/ui/LogoSpinner";
import { Button } from "@/components/ui/Button";

function handleShowSplash(
  setSplashState: Dispatch<SetStateAction<"idle" | "showing" | "fading">>,
) {
  setSplashState("showing");
  setTimeout(() => setSplashState("fading"), 2000);
  setTimeout(() => setSplashState("idle"), 2500);
}

function handleDismissSplash(
  setSplashState: Dispatch<SetStateAction<"idle" | "showing" | "fading">>,
) {
  setSplashState("fading");
  setTimeout(() => setSplashState("idle"), 500);
}

export function SplashTab() {
  const [splashState, setSplashState] = useState<"idle" | "showing" | "fading">(
    "idle",
  );

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
          className="bg-bg absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 transition-opacity duration-700"
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
