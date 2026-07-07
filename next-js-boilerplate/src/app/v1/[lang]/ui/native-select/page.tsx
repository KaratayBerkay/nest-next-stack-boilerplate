"use client";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/Tabs";
import { NativeSelect } from "@/components/ui/NativeSelect";


export default function NativeSelectPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Native Select</h2>
        <p className="text-muted text-sm">A native HTML select element.</p>
      </div>
      <Tabs defaultValue="components">
        <TabsList>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>
        <TabsContent value="components">
          <div className="flex flex-col gap-4">
            <section className="flex flex-col gap-3"><h3 className="text-lg font-semibold">Default</h3><NativeSelect className="max-w-sm"><option>Option 1</option><option>Option 2</option><option>Option 3</option></NativeSelect></section>
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
