"use client";

import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { TabbedQueryExamples } from "./TabbedQueryExamples";
import { HttpRequestTabs } from "./HttpRequestTabs";
import { ThemeHookDemo } from "./ThemeHookDemo";
import { FileTreePreview } from "./FileTreePreview";
import { ApiIntegrationSnippets } from "./ApiIntegrationSnippets";
import { SelectableHookSnippets } from "./SelectableHookSnippets";
import { DatabaseExamplesStack } from "./DatabaseExamplesStack";
import { FileOpsAccordion } from "./FileOpsAccordion";
import { AnalyticsSnippetModes } from "./AnalyticsSnippetModes";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function CodeExamplePageContent({
  initialTab,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.codeExample;

  const examples: UIExample[] = [
    {
      id: "code-example-1",
      title: t.codeExample1TabTitle,
      description: t.codeExample1TabDescription,
      render: () => <TabbedQueryExamples />,
    },
    {
      id: "code-example-2",
      title: t.codeExample2TabTitle,
      description: t.codeExample2TabDescription,
      render: () => <HttpRequestTabs />,
    },
    {
      id: "code-example-3",
      title: t.codeExample3TabTitle,
      description: t.codeExample3TabDescription,
      render: () => <ThemeHookDemo />,
    },
    {
      id: "code-example-4",
      title: t.codeExample4TabTitle,
      description: t.codeExample4TabDescription,
      render: () => <FileTreePreview />,
    },
    {
      id: "code-example-5",
      title: t.codeExample5TabTitle,
      description: t.codeExample5TabDescription,
      render: () => <ApiIntegrationSnippets />,
    },
    {
      id: "code-example-6",
      title: t.codeExample6TabTitle,
      description: t.codeExample6TabDescription,
      render: () => <SelectableHookSnippets />,
    },
    {
      id: "code-example-11",
      title: t.codeExample11TabTitle,
      description: t.codeExample11TabDescription,
      render: () => <DatabaseExamplesStack />,
    },
    {
      id: "code-example-14",
      title: t.codeExample14TabTitle,
      description: t.codeExample14TabDescription,
      render: () => <FileOpsAccordion />,
    },
    {
      id: "code-example-16",
      title: t.codeExample16TabTitle,
      description: t.codeExample16TabDescription,
      render: () => <AnalyticsSnippetModes />,
    },
  ];

  return (
    <ExampleTabs
      title={m.examples.codeExampleTitle}
      intro={m.examples.codeExampleDescription}
      examples={examples}
      initialTab={initialTab}
    />
  );
}
