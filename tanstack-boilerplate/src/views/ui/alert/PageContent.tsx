"use client";

import { Alert, AlertTitle, AlertDescription } from "@/components/ui/Alert";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { VariantGallery } from "@/views/ui/_shared/VariantGallery";
import { PopupAlertsExample } from "@/views/ui/alert/PopupAlertsExample";
import { ComponentsTab } from "@/views/ui/alert/ComponentsTab";
import { ExamplesTab } from "@/views/ui/alert/ExamplesTab";
import { ServerRetryTab } from "@/views/ui/alert/ServerRetryTab";
import type { AlertVariant } from "@/types/ui/Alert-types";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

const examples: UIExample[] = [
  {
    id: "usage",
    title: "Components",
    description:
      "All alert variants: default, info, success, warning, and error.",
    render: () => <ComponentsTab />,
  },
  {
    id: "variants",
    title: "Examples",
    description:
      "Dismissible alert with a variant switcher, plus real-world status alert examples.",
    render: () => <ExamplesTab />,
  },
  {
    id: "server-retry",
    title: "Server Retry",
    description:
      "Error alert with countdown, sticky positioning, and auto-dismiss.",
    render: () => <ServerRetryTab />,
  },
  {
    id: "popup-alerts",
    title: "Pop-up Alerts",
    description:
      "Button-triggered overlay alerts with 30-second auto-dismiss countdowns.",
    render: () => <PopupAlertsExample />,
  },
  {
    id: "variant-gallery",
    title: "Variant Gallery",
    description: "All variants and sizes.",
    render: () => (
      <VariantGallery
        variants={["default", "info", "success", "warning", "error"]}
        sizes={[]}
        render={(variant, _size) => (
          <Alert variant={variant as AlertVariant}>
            <AlertTitle>Alert Title</AlertTitle>
            <AlertDescription>
              This is a {variant} variant alert.
            </AlertDescription>
          </Alert>
        )}
      />
    ),
  },
];

export default function AlertPage({ initialTab }: InitialTabProps) {
  return (
    <ExampleTabs
      title="Alert"
      intro="Displays a callout for user attention with multiple variants."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
