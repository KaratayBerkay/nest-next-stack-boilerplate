"use client";

import { useState } from "react";
import { IconCrown, IconSearch, IconTrash, IconUsers } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { NativeSelect } from "@/components/ui/NativeSelect";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithSettingsMembersMessages } from "@/types/pages/settings-members/SettingsMembersMessages-types";

type Role = "admin" | "editor" | "viewer";

interface MemberRow {
  id: string;
  nameKey: string;
  emailKey: string;
  role: Role;
  statusKey: string;
  joinedKey: string;
  isOwner?: boolean;
}

const SEED_MEMBERS: MemberRow[] = [
  {
    id: "mtr-1",
    nameKey: "settingsMembers1Member1Name",
    emailKey: "settingsMembers1Member1Email",
    role: "admin",
    statusKey: "settingsMembers1StatusActive",
    joinedKey: "settingsMembers1Member1Joined",
    isOwner: true,
  },
  {
    id: "mtr-2",
    nameKey: "settingsMembers1Member2Name",
    emailKey: "settingsMembers1Member2Email",
    role: "admin",
    statusKey: "settingsMembers1StatusActive",
    joinedKey: "settingsMembers1Member2Joined",
  },
  {
    id: "mtr-3",
    nameKey: "settingsMembers1Member3Name",
    emailKey: "settingsMembers1Member3Email",
    role: "editor",
    statusKey: "settingsMembers1StatusActive",
    joinedKey: "settingsMembers1Member3Joined",
  },
  {
    id: "mtr-4",
    nameKey: "settingsMembers1Member4Name",
    emailKey: "settingsMembers1Member4Email",
    role: "editor",
    statusKey: "settingsMembers1StatusSuspended",
    joinedKey: "settingsMembers1Member4Joined",
  },
  {
    id: "mtr-5",
    nameKey: "settingsMembers1Member5Name",
    emailKey: "settingsMembers1Member5Email",
    role: "viewer",
    statusKey: "settingsMembers1StatusActive",
    joinedKey: "settingsMembers1Member5Joined",
  },
];

const ROLE_OPTIONS = [
  { value: "admin", labelKey: "settingsMembers1RoleAdmin" },
  { value: "editor", labelKey: "settingsMembers1RoleEditor" },
  { value: "viewer", labelKey: "settingsMembers1RoleViewer" },
] as const;

export function MemberTableRoleSettingsMembers() {
  const t = useMessages("pages") as unknown as PagesWithSettingsMembersMessages;
  const sm = t.settingsMembers;

  const [members, setMembers] = useState<MemberRow[]>(SEED_MEMBERS);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  function handleRoleChange(id: string, role: string) {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === id ? { ...member, role: role as Role } : member,
      ),
    );
  }

  function handleRemove(id: string) {
    setMembers((prev) => prev.filter((member) => member.id !== id));
  }

  const filtered = members.filter((member) => {
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    const haystack = `${sm[member.nameKey]} ${sm[member.emailKey]}`.toLowerCase();
    const matchesQuery = haystack.includes(query.trim().toLowerCase());
    return matchesRole && matchesQuery;
  });

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <CardTitle>{sm.settingsMembers1Heading}</CardTitle>
                <CardDescription>{sm.settingsMembers1Subheading}</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={sm.settingsMembers1SearchPlaceholder}
                  aria-label={sm.settingsMembers1SearchAria}
                  leftIcon={<IconSearch size={15} aria-hidden="true" />}
                  className="sm:max-w-56"
                />
                <div className="w-full sm:w-40">
                  <NativeSelect
                    value={roleFilter}
                    onChange={(event) => setRoleFilter(event.target.value)}
                    aria-label={sm.settingsMembers1RoleFilterAria}
                  >
                    <option value="all">{sm.settingsMembers1RoleFilterAll}</option>
                    {ROLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {sm[option.labelKey]}
                      </option>
                    ))}
                  </NativeSelect>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{sm.settingsMembers1ColMember}</TableHead>
                  <TableHead>{sm.settingsMembers1ColRole}</TableHead>
                  <TableHead>{sm.settingsMembers1ColStatus}</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    {sm.settingsMembers1ColJoined}
                  </TableHead>
                  <TableHead className="text-right">
                    {sm.settingsMembers1ColActions}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar fallback={sm[member.nameKey]} size="sm" />
                        <div className="flex min-w-0 flex-col">
                          <span className="text-fg truncate text-sm font-medium">
                            {sm[member.nameKey]}
                          </span>
                          <span className="text-muted truncate text-xs">
                            {sm[member.emailKey]}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {member.isOwner ? (
                        <Badge variant="soft" className="gap-1">
                          <IconCrown size={12} aria-hidden="true" />
                          {sm.settingsMembers1RoleOwner}
                        </Badge>
                      ) : (
                        <div className="w-32">
                          <NativeSelect
                            value={member.role}
                            onChange={(event) =>
                              handleRoleChange(member.id, event.target.value)
                            }
                            aria-label={`${sm.settingsMembers1RoleSelectAriaPrefix} ${sm[member.nameKey]}`}
                          >
                            {ROLE_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {sm[option.labelKey]}
                              </option>
                            ))}
                          </NativeSelect>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          member.statusKey === "settingsMembers1StatusSuspended"
                            ? "outline"
                            : "success"
                        }
                      >
                        {sm[member.statusKey]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted hidden text-xs sm:table-cell">
                      {sm[member.joinedKey]}
                    </TableCell>
                    <TableCell className="text-right">
                      {!member.isOwner && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`${sm.settingsMembers1RemoveAriaPrefix} ${sm[member.nameKey]}`}
                          onClick={() => handleRemove(member.id)}
                        >
                          <IconTrash size={14} aria-hidden="true" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-muted py-10 text-center text-sm">
                      {sm.settingsMembers1EmptyState}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <div className="text-muted flex items-center gap-1.5 text-xs">
              <IconUsers size={14} aria-hidden="true" />
              {filtered.length} / {members.length} {sm.settingsMembers1CountSuffix}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
