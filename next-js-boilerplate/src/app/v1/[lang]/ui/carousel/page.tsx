"use client";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/Tabs";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/Carousel";


export default function CarouselPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Carousel</h2>
        <p className="text-muted text-sm">A carousel with motion and swipe.</p>
      </div>
      <Tabs defaultValue="components">
        <TabsList>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>
        <TabsContent value="components">
          <div className="flex flex-col gap-4">
            <section className="flex flex-col gap-3"><h3 className="text-lg font-semibold">Default</h3><Carousel className="max-w-sm"><CarouselContent>{[1,2,3,4,5].map((i) => (<CarouselItem key={i}><div className="bg-surface flex h-32 items-center justify-center rounded-md">{i}</div></CarouselItem>))}</CarouselContent><CarouselPrevious /><CarouselNext /></Carousel></section>
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
