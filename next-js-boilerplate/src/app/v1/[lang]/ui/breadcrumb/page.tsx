"use client";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/Tabs";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbEllipsis, BreadcrumbPage as ShadBreadcrumbPage } from "@/components/ui/Breadcrumb";


export default function BreadcrumbPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Breadcrumb</h2>
        <p className="text-muted text-sm">Navigation hierarchy indicator.</p>
      </div>
      <Tabs defaultValue="components">
        <TabsList>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>
        <TabsContent value="components">
          <div className="flex flex-col gap-4">
            <section className="flex flex-col gap-3"><h3 className="text-lg font-semibold">Default</h3><Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbLink href="/docs">Docs</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><ShadBreadcrumbPage>Components</ShadBreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb></section>
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
