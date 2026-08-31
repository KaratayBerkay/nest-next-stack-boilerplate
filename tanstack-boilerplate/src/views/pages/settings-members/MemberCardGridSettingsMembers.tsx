"use client";

import { useState } from "react";
import {
  IconCheck,
  IconCrown,
  IconDotsVertical,
  IconSend2,
  IconUserMinus,
  IconX,
} from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Input } from "@/components/ui/Input";
import { NativeSelect } from "@/components/ui/NativeSelect";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithSettingsMembersMessages } from "@/types/pages/settings-members/SettingsMembersMessages-types";

type Role = "admin" | "editor" | "viewer";

interface MemberCard {
  id: string;
  nameKey?: string;
  emailKey?: string;
  email?: string;
  joinedKey?: string;
  role: Role;
  isOwner?: boolean;
  pending?: boolean;
}

const SEED: MemberCard[] = [
  {
    id: "mcg-1",
    nameKey: "settingsMembers2Member1Name",
    emailKey: "settingsMembers2Member1Email",
    joinedKey: "settingsMembers2Member1Joined",
    role: "admin",
    isOwner: true,
  },
  {
    id: "mcg-2",
    nameKey: "settingsMembers2Member2Name",
    emailKey: "settingsMembers2Member2Email",
    joinedKey: "settingsMembers2Member2Joined",
    role: "admin",
  },
  {
    id: "mcg-3",
    nameKey: "settingsMembers2Member3Name",
    emailKey: "settingsMembers2Member3Email",
    joinedKey: "settingsMembers2Member3Joined",
    role: "editor",
  },
  {
    id: "mcg-4",
    nameKey: "settingsMembers2Member4Name",
    emailKey: "settingsMembers2Member4Email",
    joinedKey: "settingsMembers2Member4Joined",
    role: "editor",
  },
  {
    id: "mcg-5",
    nameKey: "settingsMembers2Member5Name",
    emailKey: "settingsMembers2Member5Email",
    joinedKey: "settingsMembers2Member5Joined",
    role: "viewer",
  },
];

const ROLE_MENU: { value: Role; labelKey: string }[] = [
  { value: "admin", labelKey: "settingsMembers2RoleAdmin" },
  { value: "editor", labelKey: "settingsMembers2RoleEditor" },
  { value: "viewer", labelKey: "settingsMembers2RoleViewer" },
];

let inviteSeq = 0;

export function MemberCardGridSettingsMembers() {
  const t = useMessages("pages") as unknown as PagesWithSettingsMembersMessages;
  const sm = t.settingsMembers;

  const [members, setMembers] = useState<MemberCard[]>(SEED);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("viewer");

  function handleRoleChange(id: string, role: Role) {
    setMembers((prev) => prev.map((member) => (member.id === id ? { ...member, role } : member)));
  }

  function handleRemove(id: string) {
    setMembers((prev) => prev.filter((member) => member.id !== id));
  }

  function handleInvite() {
    if (!inviteEmail.trim()) return;
    inviteSeq += 1;
    setMembers((prev) => [
      ...prev,
      {
        id: `mcg-pending-${inviteSeq}`,
        email: inviteEmail.trim(),
        role: inviteRole,
        pending: true,
      },
    ]);
    setInviteEmail("");
    setInviteRole("viewer");
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-fg text-xl font-semibold tracking-tight">
              {sm.settingsMembers2Heading}
            </h2>
            <p className="text-muted text-sm">{sm.settingsMembers2Subheading}</p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="email"
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
              placeholder={sm.settingsMembers2InviteEmailPlaceholder}
              aria-label={sm.settingsMembers2InviteEmailPlaceholder}
              className="w-44 sm:w-56"
            />
            <div className="w-28">
              <NativeSelect
                value={inviteRole}
                onChange={(event) => setInviteRole(event.target.value as Role)}
                aria-label={sm.settingsMembers2InviteRoleAria}
              >
                {ROLE_MENU.map((option) => (
                  <option key={option.value} value={option.value}>
                    {sm[option.labelKey]}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <Button
              variant="primary"
              size="icon"
              aria-label={sm.settingsMembers2InviteSendAria}
              onClick={handleInvite}
              disabled={!inviteEmail.trim()}
            >
              <IconSend2 size={14} aria-hidden="true" />
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => {
            const displayName = member.nameKey ? sm[member.nameKey] : (member.email ?? "");
            const displayEmail = member.emailKey
              ? sm[member.emailKey]
              : member.pending
                ? sm.settingsMembers2PendingSubtext
                : "";
            const currentRoleLabelKey =
              ROLE_MENU.find((option) => option.value === member.role)?.labelKey ??
              "settingsMembers2RoleViewer";

            return (
              <Card key={member.id} variant="outline">
                <CardContent className="flex flex-col gap-4 pt-5 @sm:pt-6">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar fallback={displayName || "?"} size="lg" />
                      <div className="flex min-w-0 flex-col">
                        <span className="text-fg truncate text-sm font-semibold">
                          {displayName}
                        </span>
                        <span className="text-muted truncate text-xs">{displayEmail}</span>
                      </div>
                    </div>
                    {!member.isOwner && !member.pending && (
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          aria-label={`${sm.settingsMembers2CardMenuAriaPrefix} ${displayName}`}
                          className="hover:bg-surface-hover size-7 shrink-0 rounded-md"
                        >
                          <IconDotsVertical size={16} aria-hidden="true" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-48">
                          <DropdownMenuLabel>
                            {sm.settingsMembers2MenuChangeRoleLabel}
                          </DropdownMenuLabel>
                          {ROLE_MENU.map((option) => (
                            <DropdownMenuItem
                              key={option.value}
                              onClick={() => handleRoleChange(member.id, option.value)}
                              className="justify-between gap-2"
                            >
                              {sm[option.labelKey]}
                              {member.role === option.value && (
                                <IconCheck size={14} aria-hidden="true" />
                              )}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleRemove(member.id)}
                            className="text-error gap-2"
                          >
                            <IconUserMinus size={14} aria-hidden="true" />
                            {sm.settingsMembers2MenuRemove}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                    {member.pending && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`${sm.settingsMembers2CancelInviteAriaPrefix} ${displayEmail}`}
                        onClick={() => handleRemove(member.id)}
                      >
                        <IconX size={14} aria-hidden="true" />
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    {member.isOwner ? (
                      <Badge variant="soft" className="gap-1">
                        <IconCrown size={12} aria-hidden="true" />
                        {sm.settingsMembers2RoleOwner}
                      </Badge>
                    ) : member.pending ? (
                      <Badge variant="outline">{sm.settingsMembers2StatusPending}</Badge>
                    ) : (
                      <Badge variant="secondary">{sm[currentRoleLabelKey]}</Badge>
                    )}
                    {!member.pending && member.joinedKey && (
                      <span className="text-muted text-xs">{sm[member.joinedKey]}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
