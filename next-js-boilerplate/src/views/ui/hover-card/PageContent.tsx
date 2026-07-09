"use client";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/Tabs";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/HoverCard";


export default function HoverCardPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Hover Card</h2>
        <p className="text-muted text-sm">A card that appears on hover.</p>
      </div>
      <Tabs defaultValue="components">
        <TabsList>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>
        <TabsContent value="components">
          <div className="flex flex-col gap-4">
            <section className="flex flex-col gap-3"><h3 className="text-lg font-semibold">Default</h3><HoverCard><HoverCardTrigger className="text-sm underline cursor-help">Hover me</HoverCardTrigger><HoverCardContent>Content revealed on hover.</HoverCardContent></HoverCard></section>
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
