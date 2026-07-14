"use client";
import {
  H1,
  H2,
  H3,
  H4,
  Lead,
  Large,
  Small,
  Muted,
  Code,
  Quote,
} from "@/components/ui/Typography";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const examples: UIExample[] = [
  {
    id: "usage",
    title: "Article",
    description: "Headings, body text, and blockquote composition.",
    render: () => (
      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">All Styles</h3>
          <div className="space-y-3">
            <H1>Heading 1</H1>
            <H2>Heading 2</H2>
            <H3>Heading 3</H3>
            <H4>Heading 4</H4>
            <Lead>Lead paragraph</Lead>
            <Large>Large text</Large>
            <Small>Small text</Small>
            <Muted>Muted text</Muted>
            <Code>npm install</Code>
            <Quote>Blockquote</Quote>
          </div>
        </section>
      </div>
    ),
  },
  {
    id: "variants",
    title: "Type Ramp",
    description: "Each typography style annotated with its class name.",
    render: () => <div className="flex flex-col gap-4"></div>,
  },
];

export default function TypographyPage() {
  return (
    <ExampleTabs
      title="Typography"
      intro="Pre-styled typography components."
      examples={examples}
    />
  );
}
