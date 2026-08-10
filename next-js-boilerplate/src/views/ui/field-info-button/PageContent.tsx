"use client";

import { FieldInfoButton } from "@/components/ui/FieldInfoButton";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

function BasicDemo() {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">Password</span>
      <FieldInfoButton description="Must be at least 8 characters with one uppercase letter." />
    </div>
  );
}

function InFormDemo() {
  return (
    <div className="flex max-w-sm flex-col gap-3">
      <div className="flex items-center gap-2">
        <Label htmlFor="demo-email">Email</Label>
        <FieldInfoButton description="We'll never share your email with anyone." />
      </div>
      <Input id="demo-email" type="email" placeholder="you@example.com" />
    </div>
  );
}

const examples: UIExample[] = [
  {
    id: "basic",
    title: "Basic",
    description: "Info button next to a label.",
    render: () => <BasicDemo />,
  },
  {
    id: "in-form",
    title: "In Form",
    description: "Info button alongside a form field label.",
    render: () => <InFormDemo />,
  },
];

export default function FieldInfoButtonPage({ initialTab }: InitialTabProps) {
  return (
    <ExampleTabs
      title="Field Info Button"
      intro="Info button that explains a form field via tooltip."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
