"use client";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/Tabs";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink } from "@/components/ui/NavigationMenu";


export default function NavigationMenuPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Navigation Menu</h2>
        <p className="text-muted text-sm">A navigation menu component.</p>
      </div>
      <Tabs defaultValue="components">
        <TabsList>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>
        <TabsContent value="components">
          <div className="flex flex-col gap-4">
            <section className="flex flex-col gap-3"><h3 className="text-lg font-semibold">Default</h3><NavigationMenu><NavigationMenuList><NavigationMenuItem><NavigationMenuTrigger>Getting Started</NavigationMenuTrigger><NavigationMenuContent><ul className="grid w-48 gap-1 p-2"><li><NavigationMenuLink className="hover:bg-surface-hover block rounded px-2 py-1 text-sm" href="/docs">Introduction</NavigationMenuLink></li><li><NavigationMenuLink className="hover:bg-surface-hover block rounded px-2 py-1 text-sm" href="/docs">Installation</NavigationMenuLink></li></ul></NavigationMenuContent></NavigationMenuItem></NavigationMenuList></NavigationMenu></section>
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
