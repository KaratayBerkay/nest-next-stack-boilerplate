"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/Tabs";
import { ActiveTabDisplay } from "@/views/ui/tabs/ActiveTabDisplay";

export function PillFiltersTab() {
  return (
    <div className="flex flex-col gap-4">
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all" variant="pills">
            All
          </TabsTrigger>
          <TabsTrigger value="design" variant="pills">
            Design
          </TabsTrigger>
          <TabsTrigger value="dev" variant="pills">
            Development
          </TabsTrigger>
          <TabsTrigger value="marketing" variant="pills">
            Marketing
          </TabsTrigger>
          <TabsTrigger value="writing" variant="pills">
            Writing
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <div className="space-y-2 py-2">
            <p className="text-sm font-medium">All Articles</p>
            <p className="text-muted text-xs">
              Showing content from all categories.
            </p>
          </div>
        </TabsContent>
        <TabsContent value="design">
          <div className="space-y-2 py-2">
            <p className="text-sm font-medium">Design</p>
            <p className="text-muted text-xs">
              UI/UX, graphic design, and prototyping articles.
            </p>
          </div>
        </TabsContent>
        <TabsContent value="dev">
          <div className="space-y-2 py-2">
            <p className="text-sm font-medium">Development</p>
            <p className="text-muted text-xs">
              Frontend, backend, and DevOps articles.
            </p>
          </div>
        </TabsContent>
        <TabsContent value="marketing">
          <div className="space-y-2 py-2">
            <p className="text-sm font-medium">Marketing</p>
            <p className="text-muted text-xs">
              Growth, SEO, and content strategy articles.
            </p>
          </div>
        </TabsContent>
        <TabsContent value="writing">
          <div className="space-y-2 py-2">
            <p className="text-sm font-medium">Technical Writing</p>
            <p className="text-muted text-xs">
              Technical writing and documentation articles.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
