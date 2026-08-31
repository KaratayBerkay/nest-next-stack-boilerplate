"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { MemberTableDialogInviteUser } from "./MemberTableDialogInviteUser";
import { AvatarGridSheetInviteUser } from "./AvatarGridSheetInviteUser";
import { TagChipInviteUser } from "./TagChipInviteUser";
import { ShareLinkDialogInviteUser } from "./ShareLinkDialogInviteUser";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function InviteUserPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.inviteUser;

  const examples: UIExample[] = [
    {
      id: "invite-user-1",
      title: t.inviteUser1TabTitle,
      description: t.inviteUser1TabDescription,
      render: () => <MemberTableDialogInviteUser />,
    },
    {
      id: "invite-user-2",
      title: t.inviteUser2TabTitle,
      description: t.inviteUser2TabDescription,
      render: () => <AvatarGridSheetInviteUser />,
    },
    {
      id: "invite-user-3",
      title: t.inviteUser3TabTitle,
      description: t.inviteUser3TabDescription,
      render: () => <TagChipInviteUser />,
    },
    {
      id: "invite-user-4",
      title: t.inviteUser4TabTitle,
      description: t.inviteUser4TabDescription,
      render: () => <ShareLinkDialogInviteUser />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.inviteUserTitle}
      intro={m.examples.inviteUserDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="invite-user"
    />
  );
}
