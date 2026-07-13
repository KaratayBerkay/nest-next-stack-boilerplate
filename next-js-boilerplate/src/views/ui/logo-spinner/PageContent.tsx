"use client";

import { LogoSpinner } from "@/components/ui/LogoSpinner";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const examples: UIExample[] = [
  {
    id: "brand-splash",
    title: "Brand Splash",
    description: "Full-pane branded loading spinner.",
    render: () => (
      <div className="border-border bg-surface h-72 overflow-hidden rounded-lg border">
        <LogoSpinner />
      </div>
    ),
  },
  {
    id: "token-check",
    title: "Token Check",
    description: "Renders via text-brand across all four themes.",
    render: () => (
      <div className="border-border bg-surface h-72 overflow-hidden rounded-lg border">
        <LogoSpinner />
      </div>
    ),
  },
];

export default function LogoSpinnerPage() {
  return (
    <ExampleTabs
      title="Logo Spinner"
      intro="A full-page loading spinner with brand logo."
      examples={examples}
    />
  );
}
