"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Kbd } from "@/components/ui/Kbd";

export default function KbdPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Kbd</h2>
        <p className="text-muted text-sm">A keyboard shortcut indicator.</p>
      </div>
      <Tabs defaultValue="components">
        <TabsList>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>
        <TabsContent value="components">
          <div className="flex flex-col gap-4">
            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Common Shortcuts</h3>
              <div className="flex flex-wrap gap-3">
                <Kbd>Ctrl + C</Kbd>
                <Kbd>Ctrl + V</Kbd>
                <Kbd>⌘ + S</Kbd>
                <Kbd>⌘ + K</Kbd>
              </div>
            </section>
          </div>
        </TabsContent>
        <TabsContent value="examples">
          <div className="flex flex-col gap-4"></div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
