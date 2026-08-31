"use client";

import { useState } from "react";
import { IconTrash, IconX } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
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

interface MemberRow {
  id: string;
  nameKey: string;
  emailKey: string;
  roleKey: string;
  statusKey: string;
}

const SEED: MemberRow[] = [
  {
    id: "bst-1",
    nameKey: "settingsMembers5Member1Name",
    emailKey: "settingsMembers5Member1Email",
    roleKey: "settingsMembers5RoleAdmin",
    statusKey: "settingsMembers5StatusActive",
  },
  {
    id: "bst-2",
    nameKey: "settingsMembers5Member2Name",
    emailKey: "settingsMembers5Member2Email",
    roleKey: "settingsMembers5RoleEditor",
    statusKey: "settingsMembers5StatusActive",
  },
  {
    id: "bst-3",
    nameKey: "settingsMembers5Member3Name",
    emailKey: "settingsMembers5Member3Email",
    roleKey: "settingsMembers5RoleEditor",
    statusKey: "settingsMembers5StatusActive",
  },
  {
    id: "bst-4",
    nameKey: "settingsMembers5Member4Name",
    emailKey: "settingsMembers5Member4Email",
    roleKey: "settingsMembers5RoleViewer",
    statusKey: "settingsMembers5StatusSuspended",
  },
  {
    id: "bst-5",
    nameKey: "settingsMembers5Member5Name",
    emailKey: "settingsMembers5Member5Email",
    roleKey: "settingsMembers5RoleViewer",
    statusKey: "settingsMembers5StatusActive",
  },
  {
    id: "bst-6",
    nameKey: "settingsMembers5Member6Name",
    emailKey: "settingsMembers5Member6Email",
    roleKey: "settingsMembers5RoleViewer",
    statusKey: "settingsMembers5StatusActive",
  },
];

const ROLE_OPTIONS = [
  { value: "admin", labelKey: "settingsMembers5RoleAdmin" },
  { value: "editor", labelKey: "settingsMembers5RoleEditor" },
  { value: "viewer", labelKey: "settingsMembers5RoleViewer" },
] as const;

export function BulkSelectToolbarSettingsMembers() {
  const t = useMessages("pages") as unknown as PagesWithSettingsMembersMessages;
  const sm = t.settingsMembers;

  const [members, setMembers] = useState<MemberRow[]>(SEED);
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkRole, setBulkRole] = useState("editor");

  const allSelected = members.length > 0 && selected.length === members.length;

  function toggleAll() {
    setSelected(allSelected ? [] : members.map((member) => member.id));
  }

  function toggleOne(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function applyBulkRole() {
    const roleLabelKey =
      ROLE_OPTIONS.find((option) => option.value === bulkRole)?.labelKey ??
      "settingsMembers5RoleEditor";
    setMembers((prev) =>
      prev.map((member) =>
        selected.includes(member.id) ? { ...member, roleKey: roleLabelKey } : member,
      ),
    );
    setSelected([]);
  }

  function removeSelected() {
    setMembers((prev) => prev.filter((member) => !selected.includes(member.id)));
    setSelected([]);
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>{sm.settingsMembers5Heading}</CardTitle>
            <CardDescription>{sm.settingsMembers5Subheading}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {selected.length > 0 && (
              <div className="border-brand/30 bg-brand/5 flex flex-wrap items-center gap-3 rounded-lg border px-3 py-2.5">
                <span className="text-fg text-sm font-medium">
                  {selected.length} {sm.settingsMembers5SelectedSuffix}
                </span>
                <div className="ml-auto flex flex-wrap items-center gap-2">
                  <div className="w-32">
                    <NativeSelect
                      value={bulkRole}
                      onChange={(event) => setBulkRole(event.target.value)}
                      aria-label={sm.settingsMembers5BulkRoleAria}
                    >
                      {ROLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {sm[option.labelKey]}
                        </option>
                      ))}
                    </NativeSelect>
                  </div>
                  <Button variant="outline" size="sm" onClick={applyBulkRole}>
                    {sm.settingsMembers5ApplyRoleButton}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={removeSelected}
                    leftIcon={<IconTrash size={14} aria-hidden="true" />}
                  >
                    {sm.settingsMembers5RemoveSelectedButton}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={sm.settingsMembers5ClearSelectionAria}
                    onClick={() => setSelected([])}
                  >
                    <IconX size={14} aria-hidden="true" />
                  </Button>
                </div>
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={allSelected}
                      onChange={toggleAll}
                      aria-label={sm.settingsMembers5SelectAllAria}
                    />
                  </TableHead>
                  <TableHead>{sm.settingsMembers5ColMember}</TableHead>
                  <TableHead>{sm.settingsMembers5ColRole}</TableHead>
                  <TableHead>{sm.settingsMembers5ColStatus}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => {
                  const isSelected = selected.includes(member.id);
                  return (
                    <TableRow
                      key={member.id}
                      data-state={isSelected ? "selected" : undefined}
                    >
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onChange={() => toggleOne(member.id)}
                          aria-label={`${sm.settingsMembers5RowSelectAriaPrefix} ${sm[member.nameKey]}`}
                        />
                      </TableCell>
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
                        <Badge variant="secondary">{sm[member.roleKey]}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            member.statusKey === "settingsMembers5StatusSuspended"
                              ? "outline"
                              : "success"
                          }
                        >
                          {sm[member.statusKey]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
