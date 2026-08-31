"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
} from "@tanstack/react-table";
import { Avatar } from "@/components/ui/Avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
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

type StatusValue = "paid" | "pending" | "failed";

type DataTableMessages = PagesWithDataTableMessages["dataTable"];

interface TabbedRowRef {
  nameKey: string;
  emailKey: string;
  dateKey: string;
  status: StatusValue;
  amount: number;
}

interface TabbedRow {
  id: number;
  avatarSeed: string;
  name: string;
  email: string;
  date: string;
  status: StatusValue;
  statusLabel: string;
  amount: string;
}

type TabValue = "all" | StatusValue;

const STATUS_PILL_CLASSES: Record<StatusValue, string> = {
  paid: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  failed: "bg-error/10 text-error",
};

const ROW_REFS: TabbedRowRef[] = [
  {
    nameKey: "dataTable13Row1Name",
    emailKey: "dataTable13Row1Email",
    dateKey: "dataTable13Row1Date",
    status: "paid",
    amount: 1240,
  },
  {
    nameKey: "dataTable13Row2Name",
    emailKey: "dataTable13Row2Email",
    dateKey: "dataTable13Row2Date",
    status: "pending",
    amount: 860,
  },
  {
    nameKey: "dataTable13Row3Name",
    emailKey: "dataTable13Row3Email",
    dateKey: "dataTable13Row3Date",
    status: "failed",
    amount: 2150,
  },
  {
    nameKey: "dataTable13Row4Name",
    emailKey: "dataTable13Row4Email",
    dateKey: "dataTable13Row4Date",
    status: "paid",
    amount: 430,
  },
  {
    nameKey: "dataTable13Row5Name",
    emailKey: "dataTable13Row5Email",
    dateKey: "dataTable13Row5Date",
    status: "pending",
    amount: 1980,
  },
  {
    nameKey: "dataTable13Row6Name",
    emailKey: "dataTable13Row6Email",
    dateKey: "dataTable13Row6Date",
    status: "paid",
    amount: 675,
  },
];

const TABS: { value: TabValue; labelKey: string; status?: StatusValue }[] = [
  { value: "all", labelKey: "dataTable13TabAll" },
  { value: "paid", labelKey: "dataTable13TabPaid", status: "paid" },
  { value: "pending", labelKey: "dataTable13TabPending", status: "pending" },
  { value: "failed", labelKey: "dataTable13TabFailed", status: "failed" },
];

function getStatusLabel(d: DataTableMessages, status: StatusValue): string {
  switch (status) {
    case "paid":
      return d.dataTable13StatusPaid;
    case "pending":
      return d.dataTable13StatusPending;
    default:
      return d.dataTable13StatusFailed;
  }
}

function formatMoney(value: number, currency: string): string {
  return `${currency}${value.toFixed(2)}`;
}

function buildRows(d: DataTableMessages): TabbedRow[] {
  return ROW_REFS.map((row, index) => ({
    id: index,
    avatarSeed: `dt13-${index + 1}`,
    name: d[row.nameKey],
    email: d[row.emailKey],
    date: d[row.dateKey],
    status: row.status,
    statusLabel: getStatusLabel(d, row.status),
    amount: formatMoney(row.amount, d.dataTable13Currency),
  }));
}

function countByStatus(rows: TabbedRow[], status: StatusValue): number {
  return rows.filter((row) => row.status === status).length;
}

function countForTab(rows: TabbedRow[], tab: (typeof TABS)[number]): number {
  return tab.status === undefined
    ? rows.length
    : countByStatus(rows, tab.status);
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

function buildColumns(d: DataTableMessages): ColumnDef<TabbedRow>[] {
  return [
    {
      id: "customer",
      header: d.dataTable13ColumnCustomer,
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
      header: d.dataTable13ColumnEmail,
      cell: ({ row }) => (
        <span className="text-muted">{row.original.email}</span>
      ),
    },
    {
      id: "status",
      header: d.dataTable13ColumnStatus,
      cell: ({ row }) => (
        <StatusPill
          status={row.original.status}
          label={row.original.statusLabel}
        />
      ),
    },
    {
      id: "amount",
      header: d.dataTable13ColumnAmount,
      cell: ({ row }) => (
        <span className="font-medium whitespace-nowrap tabular-nums">
          {row.original.amount}
        </span>
      ),
    },
    {
      id: "date",
      header: d.dataTable13ColumnDate,
      cell: ({ row }) => (
        <span className="text-muted whitespace-nowrap">
          {row.original.date}
        </span>
      ),
    },
  ];
}

function handleTabFilterChange(
  value: string,
  column: Column<TabbedRow, unknown> | undefined,
) {
  column?.setFilterValue(value === "all" ? undefined : value);
}

function CountChip({ count }: { count: number }) {
  return (
    <span className="border-border bg-surface text-muted rounded-full border px-2 py-0.5 text-xs tabular-nums">
      {count}
    </span>
  );
}

export function TabbedFilterDataTable() {
  const t = useMessages("pages") as unknown as PagesWithDataTableMessages;
  const d = t.dataTable;
  const rows = buildRows(d);
  const columns = buildColumns(d);

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const statusColumn = table.getColumn("status");
  const activeTab = ((statusColumn?.getFilterValue() as string | undefined) ??
    "all") as TabValue;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {d.dataTable13Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.dataTable13Description}
          </Typography>
        </div>
        <div className="border-border bg-surface flex flex-col gap-4 rounded-xl border p-4 lg:p-6">
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              handleTabFilterChange(value, statusColumn)
            }
          >
            <TabsList>
              {TABS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="gap-2"
                >
                  {d[tab.labelKey]}
                  <CountChip count={countForTab(rows, tab)} />
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
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
          </Table>
        </div>
      </div>
    </section>
  );
}
