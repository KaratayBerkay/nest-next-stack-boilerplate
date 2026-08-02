"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

function BasicDemo() {
  return (
    <PageHeader
      title="Dashboard"
      description="Welcome back. Here's an overview of your account."
    />
  );
}

function WithActionsDemo() {
  return (
    <PageHeader
      title="Projects"
      description="Manage your team's projects and workflows."
      actions={<Button size="sm">New Project</Button>}
    />
  );
}

function AsH2Demo() {
  return (
    <PageHeader
      title="Section Title"
      description="A subsection heading using h2."
      as="h2"
    />
  );
}

const examples: UIExample[] = [
  {
    id: "basic",
    title: "Basic",
    description: "Title with description.",
    render: () => <BasicDemo />,
  },
  {
    id: "with-actions",
    title: "With Actions",
    description: "Title with action buttons.",
    render: () => <WithActionsDemo />,
  },
  {
    id: "as-h2",
    title: "As H2",
    description: "Render as h2 for subsections.",
    render: () => <AsH2Demo />,
  },
];

export default function PageHeaderPage({ initialTab }: InitialTabProps) {
  return (
    <ExampleTabs
      title="Page Header"
      intro="Page title with optional actions and description."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
