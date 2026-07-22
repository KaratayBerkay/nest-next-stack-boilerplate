"use client";

import { Badge } from "@/components/ui/Badge";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { VariantGallery } from "@/views/ui/_shared/VariantGallery";
import { NotificationPatternsTab } from "@/views/ui/badge/NotificationPatternsTab";
import { StatusLabelsTab } from "@/views/ui/badge/StatusLabelsTab";
import type { BadgeSize, BadgeVariant } from "@/types/ui/Badge-types";
import type { UIExample } from "@/types/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/ui/PageContent-types";

const examples: UIExample[] = [
  {
    id: "notifications",
    title: "Notifications",
    description: "Bell icons, toasts, and message badges.",
    render: () => <NotificationPatternsTab />,
  },
  {
    id: "status",
    title: "Status & Labels",
    description: "User roles, order status, and priority labels.",
    render: () => <StatusLabelsTab />,
  },
  {
    id: "variant-gallery",
    title: "Variant Gallery",
    description: "All variants and sizes.",
    render: () => (
      <VariantGallery
        variants={[
          "default",
          "secondary",
          "outline",
          "soft",
          "info",
          "success",
          "warning",
          "error",
        ]}
        sizes={["sm", "md", "lg"]}
        render={(variant, size) => (
          <Badge variant={variant as BadgeVariant} size={size as BadgeSize}>
            {variant}
          </Badge>
        )}
      />
    ),
  },
];

export default function BadgePage({ initialTab }: InitialTabProps) {
  return (
    <ExampleTabs
      title="Badge"
      intro="Displays a badge or a component that looks like a badge."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
