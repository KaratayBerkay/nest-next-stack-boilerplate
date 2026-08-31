"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { CenteredCardPasskey } from "./CenteredCardPasskey";
import { MinimalPromptPasskey } from "./MinimalPromptPasskey";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function PasskeyPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.passkey;

  const examples: UIExample[] = [
    {
      id: "passkey-1",
      title: t.passkey1TabTitle,
      description: t.passkey1TabDescription,
      render: () => <CenteredCardPasskey />,
    },
    {
      id: "passkey-2",
      title: t.passkey2TabTitle,
      description: t.passkey2TabDescription,
      render: () => <MinimalPromptPasskey />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.passkeyTitle}
      intro={m.examples.passkeyDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="passkey"
    />
  );
}
