"use client";
import { Progress } from "@/components/ui/Progress";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const examples: UIExample[] = [
  {
    id: "components",
    title: "Upload",
    description: "Animated progress bar with percentage label.",
    render: () => (
      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Default</h3>
          <Progress value={60} className="max-w-sm" />
        </section>
      </div>
    ),
  },
  {
    id: "examples",
    title: "Indeterminate",
    description: "Progress bar with indeterminate animation.",
    render: () => <div className="flex flex-col gap-4"></div>,
  },
];

export default function ProgressPage() {
  return (
    <ExampleTabs
      title="Progress"
      intro="A progress bar component."
      examples={examples}
    />
  );
}
