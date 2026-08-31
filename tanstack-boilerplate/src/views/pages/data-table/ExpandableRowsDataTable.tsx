"use client";

import { Fragment, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
  type ColumnDef,
  type ExpandedState,
} from "@tanstack/react-table";
import { IconChevronDown } from "@tabler/icons-react";
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

interface ExpandableRowRef {
  nameKey: string;
  dateKey: string;
  detailKey: string;
  priorityKey: string;
  sourceKey: string;
  assignedKey: string;
  status: StatusValue;
  plan: PlanValue;
  amount: number;
}

interface ExpandableRow {
  id: number;
  avatarSeed: string;
  name: string;
  date: string;
  detail: string;
  priority: string;
  source: string;
  assigned: string;
  status: StatusValue;
  statusLabel: string;
  plan: PlanValue;
  planLabel: string;
  amount: string;
}

const STATUS_PILL_CLASSES: Record<StatusValue, string> = {
  paid: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  failed: "bg-error/10 text-error",
  refunded: "bg-info/10 text-info",
};

const ROW_REFS: ExpandableRowRef[] = [
  {
    nameKey: "dataTable16Row1Name",
    dateKey: "dataTable16Row1Date",
    detailKey: "dataTable16Row1Detail",
    priorityKey: "dataTable16Row1Priority",
    sourceKey: "dataTable16Row1Source",
    assignedKey: "dataTable16Row1Assigned",
    status: "paid",
    plan: "pro",
    amount: 1240,
  },
  {
    nameKey: "dataTable16Row2Name",
    dateKey: "dataTable16Row2Date",
    detailKey: "dataTable16Row2Detail",
    priorityKey: "dataTable16Row2Priority",
    sourceKey: "dataTable16Row2Source",
    assignedKey: "dataTable16Row2Assigned",
    status: "pending",
    plan: "basic",
    amount: 860,
  },
  {
    nameKey: "dataTable16Row3Name",
    dateKey: "dataTable16Row3Date",
    detailKey: "dataTable16Row3Detail",
    priorityKey: "dataTable16Row3Priority",
    sourceKey: "dataTable16Row3Source",
    assignedKey: "dataTable16Row3Assigned",
    status: "failed",
    plan: "enterprise",
    amount: 2150,
  },
  {
    nameKey: "dataTable16Row4Name",
    dateKey: "dataTable16Row4Date",
    detailKey: "dataTable16Row4Detail",
    priorityKey: "dataTable16Row4Priority",
    sourceKey: "dataTable16Row4Source",
    assignedKey: "dataTable16Row4Assigned",
    status: "paid",
    plan: "basic",
    amount: 430,
  },
  {
    nameKey: "dataTable16Row5Name",
    dateKey: "dataTable16Row5Date",
    detailKey: "dataTable16Row5Detail",
    priorityKey: "dataTable16Row5Priority",
    sourceKey: "dataTable16Row5Source",
    assignedKey: "dataTable16Row5Assigned",
    status: "refunded",
    plan: "free",
    amount: 1980,
  },
  {
    nameKey: "dataTable16Row6Name",
    dateKey: "dataTable16Row6Date",
    detailKey: "dataTable16Row6Detail",
    priorityKey: "dataTable16Row6Priority",
    sourceKey: "dataTable16Row6Source",
    assignedKey: "dataTable16Row6Assigned",
    status: "pending",
    plan: "pro",
    amount: 675,
  },
];

function getStatusLabel(d: DataTableMessages, status: StatusValue): string {
  switch (status) {
    case "paid":
      return d.dataTable16StatusPaid;
    case "pending":
      return d.dataTable16StatusPending;
    case "failed":
      return d.dataTable16StatusFailed;
    default:
      return d.dataTable16StatusRefunded;
  }
}

function getPlanLabel(d: DataTableMessages, plan: PlanValue): string {
  switch (plan) {
    case "basic":
      return d.dataTable16PlanBasic;
    case "pro":
      return d.dataTable16PlanPro;
    case "enterprise":
      return d.dataTable16PlanEnterprise;
    default:
      return d.dataTable16PlanFree;
  }
}

function formatMoney(value: number, currency: string): string {
  return `${currency}${value.toFixed(2)}`;
}

function buildRows(d: DataTableMessages): ExpandableRow[] {
  return ROW_REFS.map((row, index) => ({
    id: index,
    avatarSeed: `dt16-${index + 1}`,
    name: d[row.nameKey],
    date: d[row.dateKey],
    detail: d[row.detailKey],
    priority: d[row.priorityKey],
    source: d[row.sourceKey],
    assigned: d[row.assignedKey],
    status: row.status,
    statusLabel: getStatusLabel(d, row.status),
    plan: row.plan,
    planLabel: getPlanLabel(d, row.plan),
    amount: formatMoney(row.amount, d.dataTable16Currency),
  }));
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

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border bg-surface text-muted flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs">
      <dt className="font-medium">{label}</dt>
      <dd className="text-fg font-medium">{value}</dd>
    </div>
  );
}

function ExpandedRowDetail({
  row,
  d,
}: {
  row: ExpandableRow;
  d: DataTableMessages;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <p className="text-muted max-w-2xl text-sm leading-relaxed">
        {row.detail}
      </p>
      <dl className="flex flex-wrap gap-2">
        <MetaChip label={d.dataTable16MetaPriority} value={row.priority} />
        <MetaChip label={d.dataTable16MetaSource} value={row.source} />
        <MetaChip label={d.dataTable16MetaAssigned} value={row.assigned} />
      </dl>
    </div>
  );
}

function buildColumns(d: DataTableMessages): ColumnDef<ExpandableRow>[] {
  return [
    {
      id: "expander",
      header: "",
      cell: ({ row }) => (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="text-muted"
          aria-label={d.dataTable16AriaExpand}
          aria-expanded={row.getIsExpanded()}
          onClick={row.getToggleExpandedHandler()}
        >
          <IconChevronDown
            size={16}
            className={cn(
              "transition-transform duration-200",
              row.getIsExpanded() && "rotate-180",
            )}
          />
        </Button>
      ),
    },
    {
      id: "customer",
      header: d.dataTable16ColumnCustomer,
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
            <span className="font-medium">{item.name}</span>
          </div>
        );
      },
    },
    {
      id: "plan",
      header: d.dataTable16ColumnPlan,
      cell: ({ row }) => (
        <span className="text-muted">{row.original.planLabel}</span>
      ),
    },
    {
      id: "status",
      header: d.dataTable16ColumnStatus,
      cell: ({ row }) => (
        <StatusPill
          status={row.original.status}
          label={row.original.statusLabel}
        />
      ),
    },
    {
      id: "amount",
      header: d.dataTable16ColumnAmount,
      cell: ({ row }) => (
        <span className="font-medium whitespace-nowrap tabular-nums">
          {row.original.amount}
        </span>
      ),
    },
    {
      id: "date",
      header: d.dataTable16ColumnDate,
      cell: ({ row }) => (
        <span className="text-muted whitespace-nowrap">
          {row.original.date}
        </span>
      ),
    },
  ];
}

export function ExpandableRowsDataTable() {
  const t = useMessages("pages") as unknown as PagesWithDataTableMessages;
  const d = t.dataTable;
  const rows = buildRows(d);
  const columns = buildColumns(d);
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const table = useReactTable({
    data: rows,
    columns,
    state: { expanded },
    onExpandedChange: setExpanded,
    getRowCanExpand: () => true,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {d.dataTable16Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.dataTable16Description}
          </Typography>
        </div>
        <div className="border-border bg-surface flex flex-col gap-4 rounded-xl border p-4 lg:p-6">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                  <TableRow
                    data-state={row.getIsExpanded() ? "expanded" : undefined}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {cell.getIsPlaceholder()
                          ? null
                          : flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell
                        colSpan={row.getVisibleCells().length}
                        className="bg-surface/50 p-4"
                      >
                        <ExpandedRowDetail row={row.original} d={d} />
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
