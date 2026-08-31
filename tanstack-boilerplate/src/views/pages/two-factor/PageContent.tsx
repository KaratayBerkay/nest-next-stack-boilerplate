"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { CenteredCodeTwoFactor } from "./CenteredCodeTwoFactor";
import { SplitImageTwoFactor } from "./SplitImageTwoFactor";
import { QrPairingTwoFactor } from "./QrPairingTwoFactor";
import { RecoveryCodesTwoFactor } from "./RecoveryCodesTwoFactor";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function TwoFactorPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.twoFactor;

  const examples: UIExample[] = [
    {
      id: "two-factor-1",
      title: t.twoFactor1TabTitle,
      description: t.twoFactor1TabDescription,
      render: () => <CenteredCodeTwoFactor />,
    },
    {
      id: "two-factor-2",
      title: t.twoFactor2TabTitle,
      description: t.twoFactor2TabDescription,
      render: () => <SplitImageTwoFactor />,
    },
    {
      id: "two-factor-5",
      title: t.twoFactor5TabTitle,
      description: t.twoFactor5TabDescription,
      render: () => <QrPairingTwoFactor />,
    },
    {
      id: "two-factor-6",
      title: t.twoFactor6TabTitle,
      description: t.twoFactor6TabDescription,
      render: () => <RecoveryCodesTwoFactor />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.twoFactorTitle}
      intro={m.examples.twoFactorDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="two-factor"
    />
  );
}
