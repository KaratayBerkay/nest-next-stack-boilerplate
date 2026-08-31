"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { CenteredCodeVerifyEmail } from "./CenteredCodeVerifyEmail";
import { SplitImageChecklistVerifyEmail } from "./SplitImageChecklistVerifyEmail";
import { AutoDetectVerifyEmail } from "./AutoDetectVerifyEmail";
import { MutedTroubleshootingVerifyEmail } from "./MutedTroubleshootingVerifyEmail";
import { BrandedColumnVerifyEmail } from "./BrandedColumnVerifyEmail";
import { InboxShortcutsBarVerifyEmail } from "./InboxShortcutsBarVerifyEmail";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function VerifyEmailPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.verifyEmail;

  const examples: UIExample[] = [
    {
      id: "verify-email-1",
      title: t.verifyEmail1TabTitle,
      description: t.verifyEmail1TabDescription,
      render: () => <CenteredCodeVerifyEmail />,
    },
    {
      id: "verify-email-2",
      title: t.verifyEmail2TabTitle,
      description: t.verifyEmail2TabDescription,
      render: () => <SplitImageChecklistVerifyEmail />,
    },
    {
      id: "verify-email-3",
      title: t.verifyEmail3TabTitle,
      description: t.verifyEmail3TabDescription,
      render: () => <AutoDetectVerifyEmail />,
    },
    {
      id: "verify-email-4",
      title: t.verifyEmail4TabTitle,
      description: t.verifyEmail4TabDescription,
      render: () => <MutedTroubleshootingVerifyEmail />,
    },
    {
      id: "verify-email-5",
      title: t.verifyEmail5TabTitle,
      description: t.verifyEmail5TabDescription,
      render: () => <BrandedColumnVerifyEmail />,
    },
    {
      id: "verify-email-6",
      title: t.verifyEmail6TabTitle,
      description: t.verifyEmail6TabDescription,
      render: () => <InboxShortcutsBarVerifyEmail />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.verifyEmailTitle}
      intro={m.examples.verifyEmailDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="verify-email"
    />
  );
}
