"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { FloatingFaqLauncherHelp } from "./FloatingFaqLauncherHelp";
import { LiveTicketPreviewHelp } from "./LiveTicketPreviewHelp";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function HelpPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.help;

  const examples: UIExample[] = [
    {
      id: "help-3",
      title: t.help3TabTitle,
      description: t.help3TabDescription,
      render: () => <FloatingFaqLauncherHelp />,
    },
    {
      id: "help-4",
      title: t.help4TabTitle,
      description: t.help4TabDescription,
      render: () => <LiveTicketPreviewHelp />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.helpTitle}
      intro={m.examples.helpDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="help"
    />
  );
}
