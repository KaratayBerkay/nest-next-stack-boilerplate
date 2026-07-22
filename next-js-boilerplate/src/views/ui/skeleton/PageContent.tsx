"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { VariantGallery } from "@/views/ui/_shared/VariantGallery";
import { ComponentsTab } from "@/views/ui/skeleton/ComponentsTab";
import { ExamplesTab } from "@/views/ui/skeleton/ExamplesTab";
import type { UIExample } from "@/types/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/ui/PageContent-types";
import type { SkeletonVariant } from "@/types/ui/Skeleton-types";

export default function SkeletonPage({ initialTab }: InitialTabProps) {
  const [loading, setLoading] = useState(true);

  const examples: UIExample[] = [
    {
      id: "usage",
      title: "Feed Placeholder",
      description: "Skeleton preset mimicking a feed with avatar and lines.",
      render: () => <ComponentsTab />,
    },
    {
      id: "variants",
      title: "Card Placeholder",
      description: "Skeleton preset for a card layout.",
      render: () => <ExamplesTab loading={loading} setLoading={setLoading} />,
    },
    {
      id: "variant-gallery",
      title: "Variant Gallery",
      description: "All variants and sizes.",
      render: () => (
        <VariantGallery
          variants={["default", "shiny", "glass", "neon", "gradient"]}
          sizes={[]}
          render={(variant) => (
            <Skeleton
              variant={variant as SkeletonVariant}
              className="h-4 w-20"
            />
          )}
        />
      ),
    },
  ];

  return (
    <ExampleTabs
      title="Skeleton"
      intro="A loading placeholder for content that has not loaded yet."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
