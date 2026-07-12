"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Separator } from "@/components/ui/Separator";
import { Switch } from "@/components/ui/Switch";

export default function SeparatorPage() {
  return (
    <div className="flex flex-col gap-4" data-testid="separator-demo">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Separator</h2>
        <p className="text-muted text-sm">
          A visual divider for separating content.
        </p>
      </div>

      <Tabs defaultValue="components">
        <TabsList>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="components">
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
        </TabsContent>

        <TabsContent value="examples">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
