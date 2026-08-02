"use client";

import { FormFieldInfo } from "@/components/ui/FormFieldInfo";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/ui/PageContent-types";

function ErrorState() {
  return (
    <FormFieldInfo
      field={{ state: { meta: { errors: ["This field is required"] } } }}
    />
  );
}

function ValidatingState() {
  return (
    <FormFieldInfo
      field={{ state: { meta: { errors: [], isValidating: true } } }}
    />
  );
}

function IdleState() {
  return <FormFieldInfo field={{ state: { meta: { errors: [] } } }} />;
}

const examples: UIExample[] = [
  {
    id: "error",
    title: "Error State",
    description: "Shows error text below the field.",
    render: () => <ErrorState />,
  },
  {
    id: "validating",
    title: "Validating State",
    description: "Shows a spinner while validating.",
    render: () => <ValidatingState />,
  },
  {
    id: "idle",
    title: "Idle State",
    description: "Renders nothing when there are no errors.",
    render: () => <IdleState />,
  },
];

export default function FormFieldInfoPage({ initialTab }: InitialTabProps) {
  return (
    <ExampleTabs
      title="Form Field Info"
      intro="Error text and validating spinner for form fields."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
