"use client";

import { useState } from "react";
import { IconCheck, IconCrown } from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
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

type EditableRole = "admin" | "editor" | "viewer";

interface PermissionRow {
  id: string;
  labelKey: string;
  descKey: string;
}

const PERMISSIONS: PermissionRow[] = [
  {
    id: "view",
    labelKey: "settingsMembers4Permission1Label",
    descKey: "settingsMembers4Permission1Desc",
  },
  {
    id: "invite",
    labelKey: "settingsMembers4Permission2Label",
    descKey: "settingsMembers4Permission2Desc",
  },
  {
    id: "editSettings",
    labelKey: "settingsMembers4Permission3Label",
    descKey: "settingsMembers4Permission3Desc",
  },
  {
    id: "billing",
    labelKey: "settingsMembers4Permission4Label",
    descKey: "settingsMembers4Permission4Desc",
  },
  {
    id: "removeMembers",
    labelKey: "settingsMembers4Permission5Label",
    descKey: "settingsMembers4Permission5Desc",
  },
  {
    id: "deleteWorkspace",
    labelKey: "settingsMembers4Permission6Label",
    descKey: "settingsMembers4Permission6Desc",
  },
];

const ROLE_COLUMNS: { key: EditableRole; labelKey: string; count: number }[] = [
  { key: "admin", labelKey: "settingsMembers4RoleAdmin", count: 2 },
  { key: "editor", labelKey: "settingsMembers4RoleEditor", count: 5 },
  { key: "viewer", labelKey: "settingsMembers4RoleViewer", count: 8 },
];

const INITIAL_GRANTS: Record<string, Record<EditableRole, boolean>> = {
  view: { admin: true, editor: true, viewer: true },
  invite: { admin: true, editor: true, viewer: false },
  editSettings: { admin: true, editor: false, viewer: false },
  billing: { admin: true, editor: false, viewer: false },
  removeMembers: { admin: true, editor: false, viewer: false },
  deleteWorkspace: { admin: false, editor: false, viewer: false },
};

export function RolePermissionMatrixSettingsMembers() {
  const t = useMessages("pages") as unknown as PagesWithSettingsMembersMessages;
  const sm = t.settingsMembers;

  const [grants, setGrants] = useState(INITIAL_GRANTS);

  function toggleGrant(permissionId: string, role: EditableRole) {
    setGrants((prev) => ({
      ...prev,
      [permissionId]: { ...prev[permissionId], [role]: !prev[permissionId][role] },
    }));
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>{sm.settingsMembers4Heading}</CardTitle>
            <CardDescription>{sm.settingsMembers4Subheading}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-56">{sm.settingsMembers4ColPermission}</TableHead>
                  <TableHead className="text-center">
                    <span className="inline-flex items-center gap-1">
                      <IconCrown size={12} aria-hidden="true" />
                      {sm.settingsMembers4RoleOwner}
                    </span>
                  </TableHead>
                  {ROLE_COLUMNS.map((col) => (
                    <TableHead key={col.key} className="text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <span>{sm[col.labelKey]}</span>
                        <span className="text-muted text-[0.65rem] font-normal normal-case">
                          {col.count} {sm.settingsMembers4MembersSuffix}
                        </span>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {PERMISSIONS.map((permission) => (
                  <TableRow key={permission.id}>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-fg text-sm font-medium">
                          {sm[permission.labelKey]}
                        </span>
                        <span className="text-muted text-xs">{sm[permission.descKey]}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <IconCheck size={16} className="text-success mx-auto" aria-hidden="true" />
                      <span className="sr-only">{sm.settingsMembers4GrantedLabel}</span>
                    </TableCell>
                    {ROLE_COLUMNS.map((col) => (
                      <TableCell key={col.key} className="text-center">
                        <Checkbox
                          checked={grants[permission.id][col.key]}
                          onChange={() => toggleGrant(permission.id, col.key)}
                          aria-label={`${sm[permission.labelKey]} — ${sm[col.labelKey]}`}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="text-muted text-xs">{sm.settingsMembers4FooterNote}</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
