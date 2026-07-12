"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";

export default function RadioGroupPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Radio Group</h2>
        <p className="text-muted text-sm">A set of radio buttons.</p>
      </div>
      <Tabs defaultValue="components">
        <TabsList>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>
        <TabsContent value="components">
          <div className="flex flex-col gap-4">
            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Default</h3>
              <RadioGroup defaultValue="a">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="a" id="a" />
                  <label htmlFor="a">Option A</label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="b" id="b" />
                  <label htmlFor="b">Option B</label>
                </div>
              </RadioGroup>
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
