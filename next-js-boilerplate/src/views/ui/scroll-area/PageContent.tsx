"use client";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/Tabs";
import { ScrollArea } from "@/components/ui/ScrollArea";


export default function ScrollAreaPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Scroll Area</h2>
        <p className="text-muted text-sm">A custom scroll area.</p>
      </div>
      <Tabs defaultValue="components">
        <TabsList>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>
        <TabsContent value="components">
          <div className="flex flex-col gap-4">
            <section className="flex flex-col gap-3"><h3 className="text-lg font-semibold">Default</h3><ScrollArea className="border-border h-32 max-w-sm rounded-md border p-2"><div className="space-y-2">{Array.from({length:20}).map((_,i) => <p key={i} className="text-sm">Item {i + 1}</p>)}</div></ScrollArea></section>
          </div>
        </TabsContent>
        <TabsContent value="examples">
          <div className="flex flex-col gap-4">
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
