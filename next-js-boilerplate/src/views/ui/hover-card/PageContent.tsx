"use client";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/HoverCard";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const examples: UIExample[] = [
  {
    id: "components",
    title: "User Preview",
    description: "GitHub-style profile preview on hover.",
    render: () => (
      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Default</h3>
          <HoverCard>
            <HoverCardTrigger className="cursor-help text-sm underline">
              Hover me
            </HoverCardTrigger>
            <HoverCardContent>Content revealed on hover.</HoverCardContent>
          </HoverCard>
        </section>
      </div>
    ),
  },
  {
    id: "examples",
    title: "Link Preview",
    description: "Link with title, description, and domain preview.",
    render: () => (
      <div className="flex flex-col gap-4"></div>
    ),
  },
];

export default function HoverCardPage() {
  return (
    <ExampleTabs
      title="Hover Card"
      intro="A card that appears on hover."
      examples={examples}
    />
  );
}
