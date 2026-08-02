"use client";

import { Input } from "@/components/ui/Input";
import { IconSearch, IconMail, IconLock } from "@tabler/icons-react";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/ui/PageContent-types";

function BasicInput() {
  return (
    <div className="flex max-w-sm flex-col gap-4">
      <Input placeholder="Default input" />
      <Input
        placeholder="With description"
        description="This is a helpful hint"
      />
      <Input placeholder="With error" error="This field is required" />
    </div>
  );
}

function InputWithIcons() {
  return (
    <div className="flex max-w-sm flex-col gap-4">
      <Input placeholder="Search..." leftIcon={<IconSearch size={16} />} />
      <Input placeholder="Email" rightIcon={<IconMail size={16} />} />
      <Input
        placeholder="Password"
        leftIcon={<IconLock size={16} />}
        type="password"
      />
    </div>
  );
}

function InputStates() {
  return (
    <div className="flex max-w-sm flex-col gap-4">
      <Input placeholder="Disabled" disabled />
      <Input placeholder="With error" error="Invalid value" />
      <Input
        placeholder="With description"
        description="Enter your full name"
      />
    </div>
  );
}

const examples: UIExample[] = [
  {
    id: "basic",
    title: "Basic",
    description: "Default, with description, and with error.",
    render: () => <BasicInput />,
  },
  {
    id: "icons",
    title: "With Icons",
    description: "Left and right icon slots.",
    render: () => <InputWithIcons />,
  },
  {
    id: "states",
    title: "States",
    description: "Disabled, error, and description states.",
    render: () => <InputStates />,
  },
];

export default function InputPage({ initialTab }: InitialTabProps) {
  return (
    <ExampleTabs
      title="Input"
      intro="Text input with validation, icons, and states."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
