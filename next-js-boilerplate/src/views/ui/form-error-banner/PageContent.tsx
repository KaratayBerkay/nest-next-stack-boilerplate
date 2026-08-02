"use client";

import { FormErrorBanner } from "@/components/ui/FormErrorBanner";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

function WithDismiss() {
  return (
    <FormErrorBanner message="This is an error message" onDismiss={() => {}} />
  );
}

function WithoutDismiss() {
  return <FormErrorBanner message="Non-dismissable error" />;
}

function NullMessage() {
  return <FormErrorBanner message={null} />;
}

const examples: UIExample[] = [
  {
    id: "with-dismiss",
    title: "With Dismiss",
    description: "Error banner with a close button.",
    render: () => <WithDismiss />,
  },
  {
    id: "without-dismiss",
    title: "Without Dismiss",
    description: "Error banner without a close button.",
    render: () => <WithoutDismiss />,
  },
  {
    id: "null-message",
    title: "Null Message",
    description: "Renders nothing when message is null.",
    render: () => <NullMessage />,
  },
];

export default function FormErrorBannerPage({ initialTab }: InitialTabProps) {
  return (
    <ExampleTabs
      title="Form Error Banner"
      intro="Dismissable inline error alert for form-level errors."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
