"use client";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/ToggleGroup";

export default function ToggleGroupPage() {
  const [alignment, setAlignment] = useState("a");
  const [format, setFormat] = useState<string[]>([]);

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Toggle Group</h2>
        <p className="text-muted text-sm">A group of toggle buttons.</p>
      </div>
      <Tabs defaultValue="components">
        <TabsList>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>
        <TabsContent value="components">
          <div className="flex flex-col gap-4">
            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Single Selection</h3>
              <ToggleGroup type="single" value={alignment} onValueChange={(v) => v && setAlignment(v)}>
                <ToggleGroupItem value="a">A</ToggleGroupItem>
                <ToggleGroupItem value="b">B</ToggleGroupItem>
                <ToggleGroupItem value="c">C</ToggleGroupItem>
              </ToggleGroup>
              <div className="bg-surface flex items-center justify-between rounded border border-border px-3 py-2">
                <span className="text-sm">Selected: <strong>{alignment.toUpperCase()}</strong></span>
                <button type="button" onClick={() => setAlignment("a")} className="text-muted hover:text-fg p-0.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
            </section>
          </div>
        </TabsContent>
        <TabsContent value="examples">
          <div className="flex flex-col gap-4">
            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Text Formatting</h3>
              <ToggleGroup type="multiple" value={format} onValueChange={setFormat}>
                <ToggleGroupItem value="bold">B</ToggleGroupItem>
                <ToggleGroupItem value="italic">I</ToggleGroupItem>
                <ToggleGroupItem value="underline">U</ToggleGroupItem>
              </ToggleGroup>
              <div className="bg-surface flex items-center justify-between rounded border border-border px-3 py-2">
                <span className="text-sm">Active: <strong>{format.length > 0 ? format.join(", ") : "none"}</strong></span>
                <button type="button" onClick={() => setFormat([])} className="text-muted hover:text-fg p-0.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
            </section>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
