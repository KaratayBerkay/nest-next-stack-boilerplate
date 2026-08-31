"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { WithAvatarCard } from "./WithAvatarCard";
import { WithEmailForm } from "./WithEmailForm";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function AcceptInvitePageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const t = useMessages("pages");

  const examples: UIExample[] = [
    {
      id: "with-email-form",
      title: t.acceptInvite.ai1TabTitle,
      description: t.acceptInvite.ai1TabDescription,
      render: () => <WithEmailForm />,
    },
    {
      id: "with-avatar-card",
      title: t.acceptInvite.ai2TabTitle,
      description: t.acceptInvite.ai2TabDescription,
      render: () => <WithAvatarCard />,
    },
  ];

  return (
    <TemplateBrowser
      title={t.examples.acceptInviteTitle}
      intro={t.examples.acceptInviteDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="accept-invite"
    />
  );
}
