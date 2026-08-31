"use client";

import { useState } from "react";
import {
  IconArrowsSort,
  IconChevronDown,
  IconChevronUp,
  IconMessage,
} from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { IconButton } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type { PagesWithListMessages } from "@/types/pages/list/ListMessages-types";

type SortKey = "name" | "role" | "status";
type SortDir = "asc" | "desc";
type MemberStatus = "active" | "away" | "offline";

interface MemberSeed {
  id: string;
  nameKey: string;
  roleKey: string;
  deptKey: string;
  status: MemberStatus;
}

interface DirectoryRow {
  id: string;
  name: string;
  role: string;
  dept: string;
  status: MemberStatus;
}

const MEMBER_SEEDS: MemberSeed[] = [
  {
    id: "member-1",
    nameKey: "list1Member1Name",
    roleKey: "list1Member1Role",
    deptKey: "list1Member1Dept",
    status: "active",
  },
  {
    id: "member-2",
    nameKey: "list1Member2Name",
    roleKey: "list1Member2Role",
    deptKey: "list1Member2Dept",
    status: "active",
  },
  {
    id: "member-3",
    nameKey: "list1Member3Name",
    roleKey: "list1Member3Role",
    deptKey: "list1Member3Dept",
    status: "away",
  },
  {
    id: "member-4",
    nameKey: "list1Member4Name",
    roleKey: "list1Member4Role",
    deptKey: "list1Member4Dept",
    status: "offline",
  },
  {
    id: "member-5",
    nameKey: "list1Member5Name",
    roleKey: "list1Member5Role",
    deptKey: "list1Member5Dept",
    status: "active",
  },
];

const STATUS_ORDER: Record<MemberStatus, number> = {
  active: 0,
  away: 1,
  offline: 2,
};

const STATUS_VARIANT: Record<MemberStatus, "success" | "warning" | "secondary"> = {
  active: "success",
  away: "warning",
  offline: "secondary",
};

const STATUS_LABEL_KEY: Record<MemberStatus, string> = {
  active: "list1StatusActive",
  away: "list1StatusAway",
  offline: "list1StatusOffline",
};

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) {
    return (
      <IconArrowsSort size={14} className="text-muted shrink-0" aria-hidden="true" />
    );
  }
  return dir === "asc" ? (
    <IconChevronUp size={14} className="text-fg shrink-0" aria-hidden="true" />
  ) : (
    <IconChevronDown size={14} className="text-fg shrink-0" aria-hidden="true" />
  );
}

export function SortableDirectoryList() {
  const t = useMessages("pages") as unknown as PagesWithListMessages;
  const d = t.list;
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const rows: DirectoryRow[] = MEMBER_SEEDS.map((seed) => ({
    id: seed.id,
    name: d[seed.nameKey],
    role: d[seed.roleKey],
    dept: d[seed.deptKey],
    status: seed.status,
  }));

  function compareRows(a: DirectoryRow, b: DirectoryRow): number {
    let cmp: number;
    if (sortKey === "status") cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    else if (sortKey === "role") cmp = a.role.localeCompare(b.role);
    else cmp = a.name.localeCompare(b.name);
    return sortDir === "asc" ? cmp : -cmp;
  }

  const sortedRows = [...rows].sort(compareRows);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function ariaSortFor(key: SortKey): "ascending" | "descending" | "none" {
    if (sortKey !== key) return "none";
    return sortDir === "asc" ? "ascending" : "descending";
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex flex-col gap-2">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {d.list1Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.list1Description}
          </Typography>
        </div>

        <div className="border-border bg-surface overflow-x-auto rounded-2xl border">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-border border-b">
                <th scope="col" aria-sort={ariaSortFor("name")} className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => handleSort("name")}
                    className="text-muted hover:text-fg inline-flex items-center gap-1 text-xs font-semibold tracking-wider uppercase"
                  >
                    {d.list1ColumnMember}
                    <SortIcon active={sortKey === "name"} dir={sortDir} />
                  </button>
                </th>
                <th scope="col" aria-sort={ariaSortFor("role")} className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => handleSort("role")}
                    className="text-muted hover:text-fg inline-flex items-center gap-1 text-xs font-semibold tracking-wider uppercase"
                  >
                    {d.list1ColumnRole}
                    <SortIcon active={sortKey === "role"} dir={sortDir} />
                  </button>
                </th>
                <th
                  scope="col"
                  className="text-muted px-4 py-3 text-xs font-semibold tracking-wider uppercase"
                >
                  {d.list1ColumnDepartment}
                </th>
                <th scope="col" aria-sort={ariaSortFor("status")} className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => handleSort("status")}
                    className="text-muted hover:text-fg inline-flex items-center gap-1 text-xs font-semibold tracking-wider uppercase"
                  >
                    {d.list1ColumnStatus}
                    <SortIcon active={sortKey === "status"} dir={sortDir} />
                  </button>
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  <span className="sr-only">{d.list1ColumnAction}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row) => (
                <tr
                  key={row.id}
                  className="border-border hover:bg-surface-hover border-b last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={placeholderImage(row.id, "1x1")}
                        alt=""
                        fallback={row.name.slice(0, 2)}
                        size="sm"
                      />
                      <span className="text-fg text-sm font-medium">{row.name}</span>
                    </div>
                  </td>
                  <td className="text-muted px-4 py-3 text-sm">{row.role}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" size="sm">
                      {row.dept}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[row.status]} size="sm">
                      {d[STATUS_LABEL_KEY[row.status]]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <IconButton
                      icon={<IconMessage size={16} aria-hidden="true" />}
                      label={d.list1MessageAria.replace("{name}", row.name)}
                      variant="ghost"
                      size="icon-sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
