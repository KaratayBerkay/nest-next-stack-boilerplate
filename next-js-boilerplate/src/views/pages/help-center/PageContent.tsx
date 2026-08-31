"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { CategoryGridHelpCenter } from "./CategoryGridHelpCenter";
import { SearchableFaqSupportHelpCenter } from "./SearchableFaqSupportHelpCenter";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function HelpCenterPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.helpCenter;

  const examples: UIExample[] = [
    {
      id: "help-center-1",
      title: t.helpCenter1TabTitle,
      description: t.helpCenter1TabDescription,
      render: () => <CategoryGridHelpCenter />,
    },
    {
      id: "help-center-2",
      title: t.helpCenter2TabTitle,
      description: t.helpCenter2TabDescription,
      render: () => <SearchableFaqSupportHelpCenter />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.helpCenterTitle}
      intro={m.examples.helpCenterDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="help-center"
    />
  );
}
