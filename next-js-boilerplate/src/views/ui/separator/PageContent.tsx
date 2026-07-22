"use client";

import { Separator } from "@/components/ui/Separator";
import { Switch } from "@/components/ui/Switch";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/ui/PageContent-types";

const examples: UIExample[] = [
  {
    id: "usage",
    title: "Sectioned Form",
    description: "Horizontal separator between form fieldsets.",
    render: () => (
      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Horizontal</h3>
          <p className="text-muted text-sm">Content above separator</p>
          <Separator data-testid="separator-horizontal" />
          <p className="text-muted text-sm">Content below separator</p>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Vertical</h3>
          <div className="flex h-12 items-center gap-4">
            <span className="text-muted text-sm">Left</span>
            <Separator
              orientation="vertical"
              className="h-8"
              data-testid="separator-vertical"
            />
            <span className="text-muted text-sm">Right</span>
          </div>
        </section>
      </div>
    ),
  },
  {
    id: "variants",
    title: "Toolbar Split",
    description: "Vertical separator in a toolbar layout.",
    render: () => (
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Settings Panel</h3>
        <div className="surface divide-border max-w-sm divide-y overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium">Notifications</span>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium">Sound</span>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium">Dark Mode</span>
            <Switch />
          </div>
        </div>
      </section>
    ),
  },
];

export default function SeparatorPage({ initialTab }: InitialTabProps) {
  return (
    <ExampleTabs
      title="Separator"
      intro="A visual divider for separating content."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
