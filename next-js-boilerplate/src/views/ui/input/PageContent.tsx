"use client";

import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";
import InputDemo from "./InputDemo";

const examples: UIExample[] = [
  {
    id: "components",
    title: "Login Email",
    description: "Email input with error state and description wiring.",
    render: () => <InputDemo />,
  },
  {
    id: "examples",
    title: "Search Field",
    description: "Search input with left icon and clearable button.",
    render: () => <p className="text-muted text-sm">Coming soon.</p>,
  },
];

export default function Page() {
  return (
    <ExampleTabs
      title="Input"
      intro="A text input field for user data entry."
      examples={examples}
    />
  );
}
