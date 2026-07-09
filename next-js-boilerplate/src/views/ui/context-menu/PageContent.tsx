"use client";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/Tabs";
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuLabel } from "@/components/ui/ContextMenu";


export default function ContextMenuPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Context Menu</h2>
        <p className="text-muted text-sm">A right-click context menu.</p>
      </div>
      <Tabs defaultValue="components">
        <TabsList>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>
        <TabsContent value="components">
          <div className="flex flex-col gap-4">
            <section className="flex flex-col gap-3"><h3 className="text-lg font-semibold">Default</h3><ContextMenu><ContextMenuTrigger className="border-border bg-surface flex h-32 w-64 items-center justify-center rounded-md border text-sm">Right click here</ContextMenuTrigger><ContextMenuContent><ContextMenuLabel>Actions</ContextMenuLabel><ContextMenuItem>Edit</ContextMenuItem><ContextMenuItem>Duplicate</ContextMenuItem><ContextMenuSeparator /><ContextMenuItem>Delete</ContextMenuItem></ContextMenuContent></ContextMenu></section>
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
