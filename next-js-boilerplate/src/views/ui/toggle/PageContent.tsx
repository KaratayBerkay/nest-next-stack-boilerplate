"use client";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Toggle } from "@/components/ui/Toggle";

export default function TogglePage() {
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [strikethrough, setStrikethrough] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Toggle</h2>
        <p className="text-muted text-sm">A toggle button.</p>
      </div>
      <Tabs defaultValue="components">
        <TabsList>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>
        <TabsContent value="components">
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
              <div className="bg-surface flex items-center justify-between rounded border border-border px-3 py-2">
                <span className="text-sm">
                  Active:{" "}
                  <strong>
                    {[
                      bold && "Bold",
                      italic && "Italic",
                    ]
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
        </TabsContent>
        <TabsContent value="examples">
          <div className="flex flex-col gap-4">
            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Text Formatting</h3>
              <div className="flex gap-2">
                <Toggle pressed={underline} onPressedChange={setUnderline}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 4v6a6 6 0 0 0 12 0V4" />
                    <line x1="4" x2="20" y1="20" y2="20" />
                  </svg>
                  Underline
                </Toggle>
                <Toggle pressed={strikethrough} onPressedChange={setStrikethrough}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M16 4H9a3 3 0 0 0-2.83 4" />
                    <path d="M14 12a4 4 0 0 1 0 8H6" />
                    <line x1="4" x2="20" y1="12" y2="12" />
                  </svg>
                  Strikethrough
                </Toggle>
              </div>
              <div className="bg-surface flex items-center justify-between rounded border border-border px-3 py-2">
                <span className="text-sm">
                  Active:{" "}
                  <strong>
                    {[
                      underline && "Underline",
                      strikethrough && "Strikethrough",
                    ]
                      .filter(Boolean)
                      .join(", ") || "None"}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setUnderline(false);
                    setStrikethrough(false);
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
