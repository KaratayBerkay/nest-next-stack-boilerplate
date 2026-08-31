"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { FieldMappingDialog } from "./FieldMappingDialog";
import { RecordMergeDialog } from "./RecordMergeDialog";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function FieldMappingPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.fieldMapping;

  const examples: UIExample[] = [
    {
      id: "field-mapping-1",
      title: t.fieldMapping1TabTitle,
      description: t.fieldMapping1TabDescription,
      render: () => <FieldMappingDialog />,
    },
    {
      id: "field-mapping-2",
      title: t.fieldMapping2TabTitle,
      description: t.fieldMapping2TabDescription,
      render: () => <RecordMergeDialog />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.fieldMappingTitle}
      intro={m.examples.fieldMappingDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="field-mapping"
    />
  );
}
