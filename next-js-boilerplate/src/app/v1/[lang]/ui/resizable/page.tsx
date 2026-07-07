"use client";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/Tabs";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/Resizable";


export default function ResizablePage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Resizable</h2>
        <p className="text-muted text-sm">A resizable panel container.</p>
      </div>
      <Tabs defaultValue="components">
        <TabsList>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>
        <TabsContent value="components">
          <div className="flex flex-col gap-4">
            <section className="flex flex-col gap-3"><h3 className="text-lg font-semibold">Default</h3><ResizablePanelGroup direction="horizontal" className="border-border max-w-md rounded-lg border"><ResizablePanel defaultSize={50}><div className="flex h-32 items-center justify-center text-sm">Left</div></ResizablePanel><ResizableHandle /><ResizablePanel defaultSize={50}><div className="flex h-32 items-center justify-center text-sm">Right</div></ResizablePanel></ResizablePanelGroup></section>
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
