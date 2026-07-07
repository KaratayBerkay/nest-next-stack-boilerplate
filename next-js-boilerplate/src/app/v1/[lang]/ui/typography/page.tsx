"use client";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/Tabs";
import { H1, H2, H3, H4, Lead, Large, Small, Muted, Code, Quote } from "@/components/ui/Typography";


export default function TypographyPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Typography</h2>
        <p className="text-muted text-sm">Pre-styled typography components.</p>
      </div>
      <Tabs defaultValue="components">
        <TabsList>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>
        <TabsContent value="components">
          <div className="flex flex-col gap-4">
            <section className="flex flex-col gap-3"><h3 className="text-lg font-semibold">All Styles</h3><div className="space-y-3"><H1>Heading 1</H1><H2>Heading 2</H2><H3>Heading 3</H3><H4>Heading 4</H4><Lead>Lead paragraph</Lead><Large>Large text</Large><Small>Small text</Small><Muted>Muted text</Muted><Code>npm install</Code><Quote>Blockquote</Quote></div></section>
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
