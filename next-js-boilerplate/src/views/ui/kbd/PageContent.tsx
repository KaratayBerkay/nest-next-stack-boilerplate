"use client";

import { Kbd } from "@/components/ui/Kbd";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { VariantGallery } from "@/views/ui/_shared/VariantGallery";
import type { KbdVariant } from "@/types/ui/Kbd-types";
import type { UIExample } from "@/types/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/ui/PageContent-types";

const examples: UIExample[] = [
  {
    id: "usage",
    title: "Shortcut Reference",
    description: "Two-column keyboard shortcut cheat sheet.",
    render: () => (
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
      </div>
    ),
  },
  {
    id: "variants",
    title: "Sequences",
    description: "Key combination sequences like Cmd+K style.",
    render: () => (
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
          <div className="surface space-y-3 rounded-xl p-6">
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
                <span className="text-sm">{shortcut.action}</span>
                <Kbd variant="default">{shortcut.keys}</Kbd>
              </div>
            ))}
          </div>
        </section>
      </div>
    ),
  },
  {
    id: "variant-gallery",
    title: "Variant Gallery",
    description: "All variants and sizes.",
    render: () => (
      <VariantGallery
        variants={["default", "shiny", "glass", "neon", "gradient"]}
        sizes={[]}
        render={(variant, _size) => (
          <Kbd variant={variant as KbdVariant}>⌘K</Kbd>
        )}
      />
    ),
  },
];

export default function KbdPage({ initialTab }: InitialTabProps) {
  return (
    <ExampleTabs
      title="Kbd"
      intro="A keyboard shortcut indicator with multiple variants."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
