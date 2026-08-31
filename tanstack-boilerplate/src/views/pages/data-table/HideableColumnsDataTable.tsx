"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type Table,
} from "@tanstack/react-table";
import { IconColumns } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {
  Table as TablePrimitive,
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

interface HideableRowRef {
  nameKey: string;
  emailKey: string;
  dateKey: string;
  status: StatusValue;
  plan: PlanValue;
  amount: number;
}

interface HideableRow {
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

const STATUS_PILL_CLASSES: Record<StatusValue, string> = {
  paid: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  failed: "bg-error/10 text-error",
  refunded: "bg-info/10 text-info",
};

const ROW_REFS: HideableRowRef[] = [
  {
    nameKey: "dataTable10Row1Name",
    emailKey: "dataTable10Row1Email",
    dateKey: "dataTable10Row1Date",
    status: "paid",
    plan: "pro",
    amount: 1290,
  },
  {
    nameKey: "dataTable10Row2Name",
    emailKey: "dataTable10Row2Email",
    dateKey: "dataTable10Row2Date",
    status: "pending",
    plan: "basic",
    amount: 84.5,
  },
  {
    nameKey: "dataTable10Row3Name",
    emailKey: "dataTable10Row3Email",
    dateKey: "dataTable10Row3Date",
    status: "paid",
    plan: "enterprise",
    amount: 22.4,
  },
  {
    nameKey: "dataTable10Row4Name",
    emailKey: "dataTable10Row4Email",
    dateKey: "dataTable10Row4Date",
    status: "failed",
    plan: "basic",
    amount: 340,
  },
  {
    nameKey: "dataTable10Row5Name",
    emailKey: "dataTable10Row5Email",
    dateKey: "dataTable10Row5Date",
    status: "refunded",
    plan: "pro",
    amount: 76.9,
  },
  {
    nameKey: "dataTable10Row6Name",
    emailKey: "dataTable10Row6Email",
    dateKey: "dataTable10Row6Date",
    status: "paid",
    plan: "free",
    amount: 512.6,
  },
];

function getStatusLabel(d: DataTableMessages, status: StatusValue): string {
  switch (status) {
    case "paid":
      return d.dataTable10StatusPaid;
    case "pending":
      return d.dataTable10StatusPending;
    case "failed":
      return d.dataTable10StatusFailed;
    default:
      return d.dataTable10StatusRefunded;
  }
}

function getPlanLabel(d: DataTableMessages, plan: PlanValue): string {
  switch (plan) {
    case "basic":
      return d.dataTable10PlanBasic;
    case "pro":
      return d.dataTable10PlanPro;
    case "enterprise":
      return d.dataTable10PlanEnterprise;
    default:
      return d.dataTable10PlanFree;
  }
}

function formatMoney(value: number, currency: string): string {
  return `${currency}${value.toFixed(2)}`;
}

function buildRows(d: DataTableMessages): HideableRow[] {
  return ROW_REFS.map((row, index) => ({
    id: index,
    avatarSeed: `dt10-${index + 1}`,
    name: d[row.nameKey],
    email: d[row.emailKey],
    date: d[row.dateKey],
    status: row.status,
    statusLabel: getStatusLabel(d, row.status),
    plan: row.plan,
    planLabel: getPlanLabel(d, row.plan),
    amount: formatMoney(row.amount, d.dataTable10Currency),
  }));
}

function columnLabel(d: DataTableMessages, columnId: string): string {
  switch (columnId) {
    case "customer":
      return d.dataTable10ColumnCustomer;
    case "email":
      return d.dataTable10ColumnEmail;
    case "plan":
      return d.dataTable10ColumnPlan;
    case "status":
      return d.dataTable10ColumnStatus;
    case "amount":
      return d.dataTable10ColumnAmount;
    default:
      return d.dataTable10ColumnDate;
  }
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

function buildColumns(d: DataTableMessages): ColumnDef<HideableRow>[] {
  return [
    {
      id: "customer",
      header: d.dataTable10ColumnCustomer,
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
      id: "email",
      header: d.dataTable10ColumnEmail,
      cell: ({ row }) => (
        <span className="text-muted">{row.original.email}</span>
      ),
    },
    {
      id: "plan",
      header: d.dataTable10ColumnPlan,
      cell: ({ row }) => (
        <span className="text-muted">{row.original.planLabel}</span>
      ),
    },
    {
      id: "status",
      header: d.dataTable10ColumnStatus,
      cell: ({ row }) => (
        <StatusPill
          status={row.original.status}
          label={row.original.statusLabel}
        />
      ),
    },
    {
      id: "amount",
      header: d.dataTable10ColumnAmount,
      cell: ({ row }) => (
        <span className="font-medium whitespace-nowrap tabular-nums">
          {row.original.amount}
        </span>
      ),
    },
    {
      id: "date",
      header: d.dataTable10ColumnDate,
      cell: ({ row }) => (
        <span className="text-muted whitespace-nowrap">
          {row.original.date}
        </span>
      ),
    },
  ];
}

function handleShowAll(table: Table<HideableRow>) {
  table.getAllLeafColumns().forEach((column) => column.toggleVisibility(true));
}

export function HideableColumnsDataTable() {
  const t = useMessages("pages") as unknown as PagesWithDataTableMessages;
  const d = t.dataTable;
  const rows = buildRows(d);
  const columns = buildColumns(d);

  const table = useReactTable({
    data: rows,
    columns,
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
            {d.dataTable10Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.dataTable10Description}
          </Typography>
        </div>
        <div className="border-border bg-surface flex flex-col gap-4 rounded-xl border p-4 lg:p-6">
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<IconColumns size={16} />}
                >
                  {d.dataTable10ColumnsLabel}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-60">
                {table
                  .getAllLeafColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuItem
                      key={column.id}
                      onClick={(event) => event.preventDefault()}
                    >
                      <Checkbox
                        checked={column.getIsVisible()}
                        onChange={column.getToggleVisibilityHandler()}
                        label={columnLabel(d, column.id)}
                      />
                    </DropdownMenuItem>
                  ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleShowAll(table)}>
                  {d.dataTable10ShowAll}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <TablePrimitive>
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
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </TablePrimitive>
        </div>
      </div>
    </section>
  );
}
