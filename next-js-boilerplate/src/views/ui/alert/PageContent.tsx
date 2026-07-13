"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

export default function AlertPage() {
  const [dismissed, setDismissed] = useState(false);
  const [alertVariant, setAlertVariant] = useState<
    "default" | "destructive" | "success" | "warning"
  >("default");

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Alert</h2>
        <p className="text-muted text-sm">
          Displays a callout for user attention with multiple variants.
        </p>
      </div>

      <Tabs defaultValue="components">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="components">
          <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Default</h3>
              <Alert variant="default">
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>
                  You can add components to your app using the CLI.
                </AlertDescription>
              </Alert>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Destructive</h3>
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Your session has expired. Please log in again.
                </AlertDescription>
              </Alert>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Success</h3>
              <Alert variant="success">
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  Your changes have been saved successfully.
                </AlertDescription>
              </Alert>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Warning</h3>
              <Alert variant="warning">
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  Your subscription will expire in 7 days.
                </AlertDescription>
              </Alert>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Shiny</h3>
              <Alert variant="shiny">
                <AlertTitle>Shiny Alert</AlertTitle>
                <AlertDescription>
                  A shiny gradient alert variant for emphasis.
                </AlertDescription>
              </Alert>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Glass</h3>
              <div className="bg-slate-950 p-6 rounded-xl space-y-4">
                <Alert variant="glass">
                  <AlertTitle className="text-white">Glass Alert</AlertTitle>
                  <AlertDescription className="text-white/70">
                    A frosted glass alert variant for dark backgrounds.
                  </AlertDescription>
                </Alert>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Neon</h3>
              <div className="bg-slate-950 p-6 rounded-xl space-y-4">
                <Alert variant="neon">
                  <AlertTitle className="text-cyan-400">Neon Alert</AlertTitle>
                  <AlertDescription className="text-cyan-400/70">
                    A neon glow alert variant for dark backgrounds.
                  </AlertDescription>
                </Alert>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Gradient</h3>
              <div className="bg-slate-950 p-6 rounded-xl space-y-4">
                <Alert variant="gradient">
                  <AlertTitle>Gradient Alert</AlertTitle>
                  <AlertDescription>
                    A gradient text alert variant for dark backgrounds.
                  </AlertDescription>
                </Alert>
              </div>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="examples">
          <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Dismissible Alert</h3>
              {dismissed ? (
                <div className="flex flex-col gap-3">
                  <p className="text-muted text-sm">Alert was dismissed.</p>
                  <Button onClick={() => setDismissed(false)} className="w-fit">
                    Reset
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap gap-2">
                    {(
                      ["default", "success", "warning", "destructive"] as const
                    ).map((v) => (
                      <Button
                        key={v}
                        size="sm"
                        variant={alertVariant === v ? "default" : "outline"}
                        onClick={() => setAlertVariant(v)}
                      >
                        {v}
                      </Button>
                    ))}
                  </div>
                  <Alert variant={alertVariant}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <AlertTitle>
                          {alertVariant === "default" && "Information"}
                          {alertVariant === "destructive" && "Error"}
                          {alertVariant === "success" && "Success"}
                          {alertVariant === "warning" && "Warning"}
                        </AlertTitle>
                        <AlertDescription>
                          {alertVariant === "default" &&
                            "This is an informational message."}
                          {alertVariant === "destructive" &&
                            "Something went wrong. Please try again."}
                          {alertVariant === "success" &&
                            "Operation completed successfully."}
                          {alertVariant === "warning" &&
                            "Please review your input before continuing."}
                        </AlertDescription>
                      </div>
                      <button
                        onClick={() => setDismissed(true)}
                        className="text-muted hover:text-fg shrink-0 rounded p-1 transition-colors"
                        aria-label="Dismiss"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </Alert>
                </div>
              )}
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Status Alerts</h3>
              <div className="flex flex-col gap-3">
                <Alert variant="success">
                  <div className="flex items-center gap-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <AlertTitle>Deployment Complete</AlertTitle>
                  </div>
                  <AlertDescription>
                    Your application has been deployed to production successfully.
                  </AlertDescription>
                </Alert>
                <Alert variant="warning">
                  <div className="flex items-center gap-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" x2="12" y1="9" y2="13" />
                      <line x1="12" x2="12.01" y1="17" y2="17" />
                    </svg>
                    <AlertTitle>High Memory Usage</AlertTitle>
                  </div>
                  <AlertDescription>
                    Server memory usage is at 87%. Consider scaling up.
                  </AlertDescription>
                </Alert>
                <Alert variant="destructive">
                  <div className="flex items-center gap-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" x2="9" y1="9" y2="15" />
                      <line x1="9" x2="15" y1="9" y2="15" />
                    </svg>
                    <AlertTitle>Build Failed</AlertTitle>
                  </div>
                  <AlertDescription>
                    TypeScript compilation error in src/utils/parser.ts.
                  </AlertDescription>
                </Alert>
              </div>
            </section>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
