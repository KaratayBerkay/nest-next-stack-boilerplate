"use client";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/Tabs";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/Drawer";


export default function DrawerPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Drawer</h2>
        <p className="text-muted text-sm">A modal drawer that slides in from the bottom.</p>
      </div>
      <Tabs defaultValue="components">
        <TabsList>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>
        <TabsContent value="components">
          <div className="flex flex-col gap-4">
            <section className="flex flex-col gap-3"><h3 className="text-lg font-semibold">Default</h3><Drawer><DrawerTrigger className="rounded bg-brand px-4 py-2 text-sm font-medium text-white">Open Drawer</DrawerTrigger><DrawerContent><DrawerHeader><DrawerTitle>Drawer Title</DrawerTitle><DrawerDescription>Drawer description content.</DrawerDescription></DrawerHeader><DrawerFooter><DrawerClose className="rounded border border-border px-4 py-2 text-sm">Close</DrawerClose></DrawerFooter></DrawerContent></Drawer></section>
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
