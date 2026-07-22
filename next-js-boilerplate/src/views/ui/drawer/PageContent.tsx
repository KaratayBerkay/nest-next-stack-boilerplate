"use client";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/ui/PageContent-types";
import { BasicDrawerDemo } from "./BasicDrawerDemo";
import { CartSummaryDemo } from "./CartSummaryDemo";
import { DrawerVariantGallery } from "./DrawerVariantGallery";

const examples: UIExample[] = [
  {
    id: "drawer-examples",
    title: "Drawer Examples",
    description: "Basic drawer with snap points.",
    render: () => <BasicDrawerDemo />,
  },
  {
    id: "cart-summary",
    title: "Cart Summary",
    description: "A drawer showing cart items with a total and checkout CTA.",
    render: () => <CartSummaryDemo />,
  },
  {
    id: "gallery",
    title: "Variant Gallery",
    description: "Drawer component across all theme variants and sizes.",
    render: () => <DrawerVariantGallery />,
  },
];

export default function DrawerPage({ initialTab }: InitialTabProps) {
  return (
    <ExampleTabs
      title="Drawer"
      intro="A modal drawer that slides in from the bottom."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
