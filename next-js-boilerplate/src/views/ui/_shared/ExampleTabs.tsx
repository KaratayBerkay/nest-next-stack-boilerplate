"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import type { ExampleTabsProps } from "@/types/ui/ExampleTabs-types";

export function ExampleTabs({ title, intro, examples }: ExampleTabsProps) {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-muted text-sm">{intro}</p>
      </div>
      <Tabs defaultValue={examples[0]?.id}>
        <TabsList className="flex flex-wrap gap-1">
          {examples.map((example) => (
            <TabsTrigger key={example.id} value={example.id}>
              {example.title}
            </TabsTrigger>
          ))}
        </TabsList>
        {examples.map((example) => (
          <TabsContent key={example.id} value={example.id} className="space-y-4">
            <p className="text-muted text-sm italic">{example.description}</p>
            <div>{example.render()}</div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
