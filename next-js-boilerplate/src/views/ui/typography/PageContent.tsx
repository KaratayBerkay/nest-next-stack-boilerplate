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
    render: () => (
      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Type Ramp</h3>
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <code className="text-muted w-20 text-right text-xs">H1</code>
              <H1>Heading 1</H1>
            </div>
            <div className="flex items-baseline gap-3">
              <code className="text-muted w-20 text-right text-xs">H2</code>
              <H2>Heading 2</H2>
            </div>
            <div className="flex items-baseline gap-3">
              <code className="text-muted w-20 text-right text-xs">H3</code>
              <H3>Heading 3</H3>
            </div>
            <div className="flex items-baseline gap-3">
              <code className="text-muted w-20 text-right text-xs">H4</code>
              <H4>Heading 4</H4>
            </div>
            <div className="flex items-baseline gap-3">
              <code className="text-muted w-20 text-right text-xs">Lead</code>
              <Lead>Lead paragraph — larger and lighter.</Lead>
            </div>
            <div className="flex items-baseline gap-3">
              <code className="text-muted w-20 text-right text-xs">Large</code>
              <Large>Large text block.</Large>
            </div>
            <div className="flex items-baseline gap-3">
              <code className="text-muted w-20 text-right text-xs">Small</code>
              <Small>Small print caption.</Small>
            </div>
            <div className="flex items-baseline gap-3">
              <code className="text-muted w-20 text-right text-xs">Muted</code>
              <Muted>Muted secondary text.</Muted>
            </div>
            <div className="flex items-baseline gap-3">
              <code className="text-muted w-20 text-right text-xs">Code</code>
              <Code>npm run build</Code>
            </div>
            <div className="flex items-baseline gap-3">
              <code className="text-muted w-20 text-right text-xs">Quote</code>
              <Quote>Design is not just what it looks like.</Quote>
            </div>
          </div>
        </section>
      </div>
    ),
  },
];

export default function TypographyPage({
  initialTab,
}: {
  initialTab?: string;
}) {
  return (
    <ExampleTabs
      title="Typography"
      intro="Pre-styled typography components."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
