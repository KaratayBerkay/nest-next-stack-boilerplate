"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Kbd } from "@/components/ui/Kbd";

export default function KbdPage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Kbd</h2>
        <p className="text-muted text-sm">
          A keyboard shortcut indicator with multiple variants.
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
              <div className="flex flex-wrap gap-3">
                <Kbd variant="default">Ctrl + C</Kbd>
                <Kbd variant="default">Ctrl + V</Kbd>
                <Kbd variant="default">⌘ + S</Kbd>
                <Kbd variant="default">⌘ + K</Kbd>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Shiny</h3>
              <div className="flex flex-wrap gap-3">
                <Kbd variant="shiny">Ctrl + C</Kbd>
                <Kbd variant="shiny">Ctrl + V</Kbd>
                <Kbd variant="shiny">⌘ + S</Kbd>
                <Kbd variant="shiny">⌘ + K</Kbd>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Glass</h3>
              <div className="bg-slate-950 p-6 rounded-xl space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Kbd variant="glass">Ctrl + C</Kbd>
                  <Kbd variant="glass">Ctrl + V</Kbd>
                  <Kbd variant="glass">⌘ + S</Kbd>
                  <Kbd variant="glass">⌘ + K</Kbd>
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Neon</h3>
              <div className="bg-slate-950 p-6 rounded-xl space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Kbd variant="neon">Ctrl + C</Kbd>
                  <Kbd variant="neon">Ctrl + V</Kbd>
                  <Kbd variant="neon">⌘ + S</Kbd>
                  <Kbd variant="neon">⌘ + K</Kbd>
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Gradient</h3>
              <div className="bg-slate-950 p-6 rounded-xl space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Kbd variant="gradient">Ctrl + C</Kbd>
                  <Kbd variant="gradient">Ctrl + V</Kbd>
                  <Kbd variant="gradient">⌘ + S</Kbd>
                  <Kbd variant="gradient">⌘ + K</Kbd>
                </div>
              </div>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="examples">
          <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Keyboard Shortcuts</h3>
              <div className="surface max-w-sm space-y-3 p-4">
                {[
                  { keys: "Ctrl + K", action: "Open command palette" },
                  { keys: "Ctrl + S", action: "Save current file" },
                  { keys: "Ctrl + Z", action: "Undo last action" },
                  { keys: "Ctrl + Shift + P", action: "Open settings" },
                ].map((shortcut) => (
                  <div
                    key={shortcut.keys}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm">{shortcut.action}</span>
                    <Kbd variant="default">{shortcut.keys}</Kbd>
                  </div>
                ))}
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Hotkey Reference</h3>
              <div className="bg-slate-950 p-6 rounded-xl space-y-3">
                {[
                  { keys: "⌘ + N", action: "New file" },
                  { keys: "⌘ + O", action: "Open file" },
                  { keys: "⌘ + P", action: "Quick open" },
                  { keys: "⌘ + /", action: "Toggle comment" },
                  { keys: "⌘ + D", action: "Select next occurrence" },
                ].map((shortcut) => (
                  <div
                    key={shortcut.keys}
                    className="flex items-center justify-between"
                  >
                    <span className="text-white/70 text-sm">{shortcut.action}</span>
                    <Kbd variant="neon">{shortcut.keys}</Kbd>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
