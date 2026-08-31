"use client";

import { useState } from "react";
import {
  IconMailForward,
  IconRotateClockwise2,
  IconSend2,
  IconUserMinus,
  IconX,
} from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { NativeSelect } from "@/components/ui/NativeSelect";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithSettingsMembersMessages } from "@/types/pages/settings-members/SettingsMembersMessages-types";

interface ActiveMember {
  id: string;
  nameKey: string;
  emailKey: string;
  roleKey: string;
}

interface PendingInvite {
  id: string;
  emailKey?: string;
  email?: string;
  roleKey: string;
  sinceKey?: string;
}

const ACTIVE_SEED: ActiveMember[] = [
  {
    id: "pat-a1",
    nameKey: "settingsMembers3Member1Name",
    emailKey: "settingsMembers3Member1Email",
    roleKey: "settingsMembers3RoleAdmin",
  },
  {
    id: "pat-a2",
    nameKey: "settingsMembers3Member2Name",
    emailKey: "settingsMembers3Member2Email",
    roleKey: "settingsMembers3RoleEditor",
  },
  {
    id: "pat-a3",
    nameKey: "settingsMembers3Member3Name",
    emailKey: "settingsMembers3Member3Email",
    roleKey: "settingsMembers3RoleEditor",
  },
  {
    id: "pat-a4",
    nameKey: "settingsMembers3Member4Name",
    emailKey: "settingsMembers3Member4Email",
    roleKey: "settingsMembers3RoleViewer",
  },
];

const PENDING_SEED: PendingInvite[] = [
  {
    id: "pat-p1",
    emailKey: "settingsMembers3Pending1Email",
    roleKey: "settingsMembers3RoleEditor",
    sinceKey: "settingsMembers3Pending1Since",
  },
  {
    id: "pat-p2",
    emailKey: "settingsMembers3Pending2Email",
    roleKey: "settingsMembers3RoleViewer",
    sinceKey: "settingsMembers3Pending2Since",
  },
];

const ROLE_OPTIONS = [
  { value: "admin", labelKey: "settingsMembers3RoleAdmin" },
  { value: "editor", labelKey: "settingsMembers3RoleEditor" },
  { value: "viewer", labelKey: "settingsMembers3RoleViewer" },
] as const;

let pendingSeq = 0;

export function PendingActiveTabsSettingsMembers() {
  const t = useMessages("pages") as unknown as PagesWithSettingsMembersMessages;
  const sm = t.settingsMembers;

  const [active, setActive] = useState<ActiveMember[]>(ACTIVE_SEED);
  const [pending, setPending] = useState<PendingInvite[]>(PENDING_SEED);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [resentId, setResentId] = useState("");

  function handleInvite() {
    if (!email.trim()) return;
    pendingSeq += 1;
    const roleKey =
      ROLE_OPTIONS.find((option) => option.value === role)?.labelKey ??
      "settingsMembers3RoleEditor";
    setPending((prev) => [
      ...prev,
      { id: `pat-pending-${pendingSeq}`, email: email.trim(), roleKey },
    ]);
    setEmail("");
    setRole("editor");
  }

  function handleResend(id: string) {
    setResentId(id);
    setTimeout(() => setResentId(""), 2000);
  }

  function handleCancelInvite(id: string) {
    setPending((prev) => prev.filter((invite) => invite.id !== id));
  }

  function handleRemoveActive(id: string) {
    setActive((prev) => prev.filter((member) => member.id !== id));
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>{sm.settingsMembers3Heading}</CardTitle>
            <CardDescription>{sm.settingsMembers3Subheading}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="border-border bg-surface flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center">
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={sm.settingsMembers3InvitePlaceholder}
                aria-label={sm.settingsMembers3InvitePlaceholder}
                className="flex-1"
              />
              <div className="flex items-center gap-2">
                <div className="w-32">
                  <NativeSelect
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                    aria-label={sm.settingsMembers3InviteRoleAria}
                  >
                    {ROLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {sm[option.labelKey]}
                      </option>
                    ))}
                  </NativeSelect>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleInvite}
                  disabled={!email.trim()}
                  leftIcon={<IconSend2 size={14} aria-hidden="true" />}
                  className="shrink-0"
                >
                  {sm.settingsMembers3InviteButton}
                </Button>
              </div>
            </div>

            <Tabs defaultValue="active">
              <TabsList>
                <TabsTrigger value="active" className="gap-1.5">
                  {sm.settingsMembers3TabActive}
                  <Badge variant="soft" size="sm" pill>
                    {active.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="pending" className="gap-1.5">
                  {sm.settingsMembers3TabPending}
                  <Badge variant="soft" size="sm" pill>
                    {pending.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="mt-4">
                <div className="divide-border flex flex-col divide-y">
                  {active.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 py-3">
                      <Avatar fallback={sm[member.nameKey]} size="sm" />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="text-fg truncate text-sm font-medium">
                          {sm[member.nameKey]}
                        </span>
                        <span className="text-muted truncate text-xs">
                          {sm[member.emailKey]}
                        </span>
                      </div>
                      <Badge variant="secondary">{sm[member.roleKey]}</Badge>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`${sm.settingsMembers3RemoveActiveAriaPrefix} ${sm[member.nameKey]}`}
                        onClick={() => handleRemoveActive(member.id)}
                      >
                        <IconUserMinus size={14} aria-hidden="true" />
                      </Button>
                    </div>
                  ))}
                  {active.length === 0 && (
                    <p className="text-muted py-6 text-center text-sm">
                      {sm.settingsMembers3EmptyActive}
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="pending" className="mt-4">
                <div className="divide-border flex flex-col divide-y">
                  {pending.map((invite) => {
                    const displayEmail = invite.emailKey
                      ? sm[invite.emailKey]
                      : (invite.email ?? "");
                    return (
                      <div key={invite.id} className="flex items-center gap-3 py-3">
                        <span className="border-border bg-surface text-muted flex size-8 shrink-0 items-center justify-center rounded-full border">
                          <IconMailForward size={14} aria-hidden="true" />
                        </span>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="text-fg truncate text-sm font-medium">
                            {displayEmail}
                          </span>
                          <span className="text-muted truncate text-xs">
                            {invite.sinceKey ? sm[invite.sinceKey] : sm.settingsMembers3JustNow}
                          </span>
                        </div>
                        <Badge variant="outline">{sm[invite.roleKey]}</Badge>
                        <Button variant="ghost" size="sm" onClick={() => handleResend(invite.id)}>
                          {resentId === invite.id ? (
                            <span className="text-success">{sm.settingsMembers3ResentLabel}</span>
                          ) : (
                            <>
                              <IconRotateClockwise2 size={13} aria-hidden="true" />
                              {sm.settingsMembers3ResendButton}
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`${sm.settingsMembers3CancelInviteAriaPrefix} ${displayEmail}`}
                          onClick={() => handleCancelInvite(invite.id)}
                        >
                          <IconX size={14} aria-hidden="true" />
                        </Button>
                      </div>
                    );
                  })}
                  {pending.length === 0 && (
                    <p className="text-muted py-6 text-center text-sm">
                      {sm.settingsMembers3EmptyPending}
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
