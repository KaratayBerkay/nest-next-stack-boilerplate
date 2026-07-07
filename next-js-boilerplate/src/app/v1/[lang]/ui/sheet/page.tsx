"use client";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/Tabs";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/Sheet";


export default function SheetPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Sheet</h2>
        <p className="text-muted text-sm">A slide-in panel from the edge.</p>
      </div>
      <Tabs defaultValue="components">
        <TabsList>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>
        <TabsContent value="components">
          <div className="flex flex-col gap-4">
            <section className="flex flex-col gap-3"><h3 className="text-lg font-semibold">Default</h3><Sheet><SheetTrigger className="rounded bg-brand px-4 py-2 text-sm font-medium text-white">Open Sheet</SheetTrigger><SheetContent side="right"><SheetHeader><SheetTitle>Sheet Title</SheetTitle><SheetDescription>Sheet description content.</SheetDescription></SheetHeader></SheetContent></Sheet></section>
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
