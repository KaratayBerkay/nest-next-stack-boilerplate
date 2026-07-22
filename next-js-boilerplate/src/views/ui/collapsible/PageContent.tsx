"use client";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/Collapsible";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { VariantGallery } from "@/views/ui/_shared/VariantGallery";
import { Chevron } from "@/views/ui/collapsible/Chevron";
import { ReadMoreTab } from "@/views/ui/collapsible/ReadMoreTab";
import { SidebarGroupsTab } from "@/views/ui/collapsible/SidebarGroupsTab";
import { OrderSummaryTab } from "@/views/ui/collapsible/OrderSummaryTab";
import { AdvancedSettingsTab } from "@/views/ui/collapsible/AdvancedSettingsTab";
import { StarredReposTab } from "@/views/ui/collapsible/StarredReposTab";
import type { GlobalVariant } from "@/components/ui/global-style-variants";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const examples: UIExample[] = [
  {
    id: "read-more",
    title: "Read More",
    description: "Article card that expands truncated paragraph content.",
    render: () => <ReadMoreTab />,
  },
  {
    id: "sidebar-groups",
    title: "Sidebar Groups",
    description: "Navigation sections with collapsible group headers.",
    render: () => <SidebarGroupsTab />,
  },
  {
    id: "order-summary",
    title: "Order Summary",
    description: "Checkout summary with line items behind a total row.",
    render: () => <OrderSummaryTab />,
  },
  {
    id: "advanced-settings",
    title: "Advanced Settings",
    description: "Form that hides rarely-used options until requested.",
    render: () => <AdvancedSettingsTab />,
  },
  {
    id: "starred-repos",
    title: "Show More List",
    description: "First item always visible, the rest behind a toggle.",
    render: () => <StarredReposTab />,
  },
  {
    id: "variant-gallery",
    title: "Variant Gallery",
    description: "Trigger rendered in every global style variant.",
    render: () => (
      <VariantGallery
        variants={["default", "shiny", "glass", "neon", "gradient"]}
        sizes={[]}
        render={(variant) => (
          <Collapsible defaultOpen>
            <CollapsibleTrigger
              variant={
                variant === "default" ? undefined : (variant as GlobalVariant)
              }
              className="group flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium"
            >
              Details
              <Chevron />
            </CollapsibleTrigger>
            <CollapsibleContent className="text-muted px-3 py-1.5 text-xs">
              Collapsible content area.
            </CollapsibleContent>
          </Collapsible>
        )}
      />
    ),
  },
];

export default function CollapsiblePage({
  initialTab,
}: {
  initialTab?: string;
}) {
  return (
    <ExampleTabs
      title="Collapsible"
      intro="An interactive component that expands/collapses a content region."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
