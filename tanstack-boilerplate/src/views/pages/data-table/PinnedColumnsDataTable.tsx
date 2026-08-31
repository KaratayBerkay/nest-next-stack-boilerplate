"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type ColumnPinningState,
} from "@tanstack/react-table";
import { IconDotsVertical } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDataTableMessages } from "@/types/pages/data-table/DataTableMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

type StatusValue = "paid" | "pending" | "failed" | "refunded";
type PlanValue = "basic" | "pro" | "enterprise" | "free";

type DataTableMessages = PagesWithDataTableMessages["dataTable"];

interface PinnedRowRef {
  nameKey: string;
  emailKey: string;
  dateKey: string;
  status: StatusValue;
  plan: PlanValue;
  amount: number;
}

interface PinnedRow {
  id: number;
  avatarSeed: string;
  name: string;
  email: string;
  date: string;
  status: StatusValue;
  statusLabel: string;
  plan: PlanValue;
  planLabel: string;
  amount: string;
}

interface PinnedStyles {
  className?: string;
  style?: CSSProperties;
}

const STATUS_PILL_CLASSES: Record<StatusValue, string> = {
  paid: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  failed: "bg-error/10 text-error",
  refunded: "bg-info/10 text-info",
};

const ROW_REFS: PinnedRowRef[] = [
  {
    nameKey: "dataTable15Row1Name",
    emailKey: "dataTable15Row1Email",
    dateKey: "dataTable15Row1Date",
    status: "paid",
    plan: "pro",
    amount: 1240,
  },
  {
    nameKey: "dataTable15Row2Name",
    emailKey: "dataTable15Row2Email",
    dateKey: "dataTable15Row2Date",
    status: "pending",
    plan: "basic",
    amount: 860,
  },
  {
    nameKey: "dataTable15Row3Name",
    emailKey: "dataTable15Row3Email",
    dateKey: "dataTable15Row3Date",
    status: "paid",
    plan: "enterprise",
    amount: 2150,
  },
  {
    nameKey: "dataTable15Row4Name",
    emailKey: "dataTable15Row4Email",
    dateKey: "dataTable15Row4Date",
    status: "failed",
    plan: "basic",
    amount: 430,
  },
  {
    nameKey: "dataTable15Row5Name",
    emailKey: "dataTable15Row5Email",
    dateKey: "dataTable15Row5Date",
    status: "refunded",
    plan: "pro",
    amount: 1980,
  },
  {
    nameKey: "dataTable15Row6Name",
    emailKey: "dataTable15Row6Email",
    dateKey: "dataTable15Row6Date",
    status: "paid",
    plan: "free",
    amount: 675,
  },
];

function getStatusLabel(d: DataTableMessages, status: StatusValue): string {
  switch (status) {
    case "paid":
      return d.dataTable15StatusPaid;
    case "pending":
      return d.dataTable15StatusPending;
    case "failed":
      return d.dataTable15StatusFailed;
    default:
      return d.dataTable15StatusRefunded;
  }
}

function getPlanLabel(d: DataTableMessages, plan: PlanValue): string {
  switch (plan) {
    case "basic":
      return d.dataTable15PlanBasic;
    case "pro":
      return d.dataTable15PlanPro;
    case "enterprise":
      return d.dataTable15PlanEnterprise;
    default:
      return d.dataTable15PlanFree;
  }
}

function formatMoney(value: number, currency: string): string {
  return `${currency}${value.toFixed(2)}`;
}

function buildRows(d: DataTableMessages): PinnedRow[] {
  return ROW_REFS.map((row, index) => ({
    id: index,
    avatarSeed: `dt15-${index + 1}`,
    name: d[row.nameKey],
    email: d[row.emailKey],
    date: d[row.dateKey],
    status: row.status,
    statusLabel: getStatusLabel(d, row.status),
    plan: row.plan,
    planLabel: getPlanLabel(d, row.plan),
    amount: formatMoney(row.amount, d.dataTable15Currency),
  }));
}

function getPinnedStyles(column: Column<PinnedRow, unknown>): PinnedStyles {
  if (column.getIsPinned() === "left") {
    return {
      className:
        "sticky left-0 z-10 border-r border-border bg-surface shadow-xs",
      style: { left: column.getStart("left") },
    };
  }
  if (column.getIsPinned() === "right") {
    return {
      className:
        "sticky right-0 z-10 border-l border-border bg-surface shadow-xs",
      style: { right: column.getAfter("right") },
    };
  }
  return { className: "" };
}

function StatusPill({ status, label }: { status: StatusValue; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        STATUS_PILL_CLASSES[status],
      )}
    >
      {label}
    </span>
  );
}

function buildColumns(d: DataTableMessages): ColumnDef<PinnedRow>[] {
  return [
    {
      id: "name",
      header: d.dataTable15ColumnName,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar
              src={placeholderImage(item.avatarSeed, "1x1")}
              alt={item.name}
              fallback={item.name}
              size="sm"
            />
            <span className="font-medium whitespace-nowrap">{item.name}</span>
          </div>
        );
      },
    },
    {
      id: "email",
      header: d.dataTable15ColumnEmail,
      cell: ({ row }) => (
        <span className="text-muted">{row.original.email}</span>
      ),
    },
    {
      id: "status",
      header: d.dataTable15ColumnStatus,
      cell: ({ row }) => (
        <StatusPill
          status={row.original.status}
          label={row.original.statusLabel}
        />
      ),
    },
    {
      id: "plan",
      header: d.dataTable15ColumnPlan,
      cell: ({ row }) => (
        <span className="text-muted">{row.original.planLabel}</span>
      ),
    },
    {
      id: "amount",
      header: d.dataTable15ColumnAmount,
      cell: ({ row }) => (
        <span className="font-medium whitespace-nowrap tabular-nums">
          {row.original.amount}
        </span>
      ),
    },
    {
      id: "date",
      header: d.dataTable15ColumnDate,
      cell: ({ row }) => (
        <span className="text-muted whitespace-nowrap">
          {row.original.date}
        </span>
      ),
    },
    {
      id: "actions",
      header: d.dataTable15ColumnActions,
      cell: () => (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={d.dataTable15ColumnActions}
        >
          <IconDotsVertical size={16} />
        </Button>
      ),
    },
  ];
}

export function PinnedColumnsDataTable() {
  const t = useMessages("pages") as unknown as PagesWithDataTableMessages;
  const d = t.dataTable;
  const rows = buildRows(d);
  const columns = buildColumns(d);
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    left: ["name"],
    right: ["actions"],
  });

  const table = useReactTable({
    data: rows,
    columns,
    state: { columnPinning },
    onColumnPinningChange: setColumnPinning,
    enableColumnPinning: true,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {d.dataTable15Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.dataTable15Description}
          </Typography>
        </div>
        <Table className="min-w-[760px]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const pinned = getPinnedStyles(header.column);
                  return (
                    <TableHead
                      key={header.id}
                      className={pinned.className}
                      style={pinned.style}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  const pinned = getPinnedStyles(cell.column);
                  return (
                    <TableCell
                      key={cell.id}
                      className={pinned.className}
                      style={pinned.style}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
