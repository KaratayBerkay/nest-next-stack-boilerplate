"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { CenteredProviderMagicLink } from "./CenteredProviderMagicLink";
import { SplitCodeFallbackMagicLink } from "./SplitCodeFallbackMagicLink";
import { InlinePillMagicLink } from "./InlinePillMagicLink";
import { MutedSecurityPanelMagicLink } from "./MutedSecurityPanelMagicLink";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function MagicLinkPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.magicLink;

  const examples: UIExample[] = [
    {
      id: "magic-link-1",
      title: t.magicLink1TabTitle,
      description: t.magicLink1TabDescription,
      render: () => <CenteredProviderMagicLink />,
    },
    {
      id: "magic-link-2",
      title: t.magicLink2TabTitle,
      description: t.magicLink2TabDescription,
      render: () => <SplitCodeFallbackMagicLink />,
    },
    {
      id: "magic-link-3",
      title: t.magicLink3TabTitle,
      description: t.magicLink3TabDescription,
      render: () => <InlinePillMagicLink />,
    },
    {
      id: "magic-link-4",
      title: t.magicLink4TabTitle,
      description: t.magicLink4TabDescription,
      render: () => <MutedSecurityPanelMagicLink />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.magicLinkTitle}
      intro={m.examples.magicLinkDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="magic-link"
    />
  );
}
