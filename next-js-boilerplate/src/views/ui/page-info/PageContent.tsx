"use client";

import { PageInfoButton } from "@/components/ui/PageInfo";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/ui/PageContent-types";
import type { PageInfoContent } from "@/types/ui/PageInfo-types";

const sampleContent: PageInfoContent = {
  title: "Billing",
  description: "How billing works for your account.",
  sections: [
    {
      title: "Free Tier",
      description: "You get 1,000 requests per month at no cost.",
    },
    {
      title: "Pro Tier",
      description: "Unlimited requests for $19/month.",
    },
  ],
  tips: [
    "Upgrades take effect immediately.",
    "Downgrades apply at the end of the billing cycle.",
  ],
};

function BasicDemo() {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Billing</span>
      <PageInfoButton content={sampleContent} />
    </div>
  );
}

function MinimalDemo() {
  return (
    <PageInfoButton
      content={{
        title: "Keyboard Shortcuts",
        description: "Navigate faster with these shortcuts.",
        sections: [
          { title: "Ctrl+K", description: "Open command palette" },
          { title: "Ctrl+/", description: "Toggle sidebar" },
        ],
      }}
    />
  );
}

const examples: UIExample[] = [
  {
    id: "basic",
    title: "Basic",
    description: "Info button that opens a dialog with sections and tips.",
    render: () => <BasicDemo />,
  },
  {
    id: "minimal",
    title: "Minimal",
    description: "Just the icon button, no label.",
    render: () => <MinimalDemo />,
  },
];

export default function PageInfoPage({ initialTab }: InitialTabProps) {
  return (
    <ExampleTabs
      title="Page Info"
      intro="Info button that explains a page section via dialog."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
