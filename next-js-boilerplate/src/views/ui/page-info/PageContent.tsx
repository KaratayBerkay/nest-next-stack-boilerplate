"use client";

import { PageInfoButton } from "@/components/ui/page-info";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const sampleContent = {
  title: "Dashboard",
  description: "The main dashboard page shows an overview of your account activity and metrics.",
  sections: [
    {
      title: "Activity Feed",
      description: "Displays recent actions taken by team members across all projects.",
    },
    {
      title: "Metrics Chart",
      description: "A line chart showing key performance indicators over the last 30 days.",
    },
  ],
  tips: [
    "Use the date picker to filter the metrics by a custom date range.",
    "Click on any activity item to see more details.",
  ],
};

const examples: UIExample[] = [
  {
    id: "page-header-meta",
    title: "Page Header Meta",
    description: "Info button that reveals page metadata in a dialog.",
    render: () => (
      <div className="flex items-center gap-2">
        <h3 className="text-fg text-lg font-semibold">Dashboard</h3>
        <PageInfoButton content={sampleContent} />
      </div>
    ),
  },
];

export default function PageInfoPage() {
  return (
    <ExampleTabs
      title="Page Info"
      intro="An info button that opens a dialog with page metadata and tips."
      examples={examples}
    />
  );
}
