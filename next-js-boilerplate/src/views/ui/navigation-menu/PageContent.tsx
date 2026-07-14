"use client";

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@/components/ui/NavigationMenu";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const examples: UIExample[] = [
  {
    id: "usage",
    title: "Product Mega Menu",
    description: "Navigation menu with viewport panels.",
    render: () => (
      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Default</h3>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>
                  Getting Started
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-48 gap-1 p-2">
                    <li>
                      <NavigationMenuLink
                        className="hover:bg-surface-hover block rounded px-2 py-1 text-sm"
                        href="/docs"
                      >
                        Introduction
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink
                        className="hover:bg-surface-hover block rounded px-2 py-1 text-sm"
                        href="/docs"
                      >
                        Installation
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </section>
      </div>
    ),
  },
  {
    id: "variants",
    title: "Simple Links Row",
    description: "Horizontal links without viewport panels.",
    render: () => (
      <div className="flex flex-col gap-4"></div>
    ),
  },
];

export default function NavigationMenuPage() {
  return (
    <ExampleTabs
      title="Navigation Menu"
      intro="A navigation menu component."
      examples={examples}
    />
  );
}
