"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { AspectRatio } from "@/components/ui/AspectRatio";

export default function AspectRatioPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Aspect Ratio</h2>
        <p className="text-muted text-sm">
          Displays content within a desired ratio.
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
              <h3 className="text-lg font-semibold">16:9</h3>
              <AspectRatio ratio={16 / 9} className="bg-surface rounded-md">
                <div className="text-muted flex h-full items-center justify-center text-sm">
                  16:9 content area
                </div>
              </AspectRatio>
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
