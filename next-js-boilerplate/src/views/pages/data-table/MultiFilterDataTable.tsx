"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type Table as TanTable,
} from "@tanstack/react-table";
import { IconFilterOff, IconInbox, IconSearch } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { NativeSelect } from "@/components/ui/NativeSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
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

type StatusValue = "paid" | "pending" | "failed" | "refunded";
type PlanValue = "basic" | "pro" | "enterprise" | "free";

type DataTableMessages = PagesWithDataTableMessages["dataTable"];

interface MultiRowRef {
  nameKey: string;
  emailKey: string;
  dateKey: string;
  status: StatusValue;
  plan: PlanValue;
  amount: number;
}

interface MultiRow {
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

const STATUS_ORDER: StatusValue[] = ["paid", "pending", "failed", "refunded"];
const PLAN_ORDER: PlanValue[] = ["basic", "pro", "enterprise", "free"];

const ROW_REFS: MultiRowRef[] = [
  {
    nameKey: "dataTable14Row1Name",
    emailKey: "dataTable14Row1Email",
    dateKey: "dataTable14Row1Date",
    status: "paid",
    plan: "basic",
    amount: 1240,
  },
  {
    nameKey: "dataTable14Row2Name",
    emailKey: "dataTable14Row2Email",
    dateKey: "dataTable14Row2Date",
    status: "pending",
    plan: "pro",
    amount: 860,
  },
  {
    nameKey: "dataTable14Row3Name",
    emailKey: "dataTable14Row3Email",
    dateKey: "dataTable14Row3Date",
    status: "failed",
    plan: "enterprise",
    amount: 2150,
  },
  {
    nameKey: "dataTable14Row4Name",
    emailKey: "dataTable14Row4Email",
    dateKey: "dataTable14Row4Date",
    status: "paid",
    plan: "basic",
    amount: 430,
  },
  {
    nameKey: "dataTable14Row5Name",
    emailKey: "dataTable14Row5Email",
    dateKey: "dataTable14Row5Date",
    status: "refunded",
    plan: "free",
    amount: 1980,
  },
  {
    nameKey: "dataTable14Row6Name",
    emailKey: "dataTable14Row6Email",
    dateKey: "dataTable14Row6Date",
    status: "pending",
    plan: "pro",
    amount: 675,
  },
];

function getStatusLabel(d: DataTableMessages, status: StatusValue): string {
  switch (status) {
    case "paid":
      return d.dataTable14StatusPaid;
    case "pending":
      return d.dataTable14StatusPending;
    case "failed":
      return d.dataTable14StatusFailed;
    default:
      return d.dataTable14StatusRefunded;
  }
}

function getPlanLabel(d: DataTableMessages, plan: PlanValue): string {
  switch (plan) {
    case "basic":
      return d.dataTable14PlanBasic;
    case "pro":
      return d.dataTable14PlanPro;
    case "enterprise":
      return d.dataTable14PlanEnterprise;
    default:
      return d.dataTable14PlanFree;
  }
}

function formatMoney(value: number, currency: string): string {
  return `${currency}${value.toFixed(2)}`;
}

function buildRows(d: DataTableMessages): MultiRow[] {
  return ROW_REFS.map((row, index) => ({
    id: index,
    avatarSeed: `dt14-${index + 1}`,
    name: d[row.nameKey],
    email: d[row.emailKey],
    date: d[row.dateKey],
    status: row.status,
    statusLabel: getStatusLabel(d, row.status),
    plan: row.plan,
    planLabel: getPlanLabel(d, row.plan),
    amount: formatMoney(row.amount, d.dataTable14Currency),
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

function buildColumns(d: DataTableMessages): ColumnDef<MultiRow>[] {
  return [
    {
      id: "customer",
      header: d.dataTable14ColumnCustomer,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar
              src={`https://picsum.photos/seed/${item.avatarSeed}/64/64`}
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
      header: d.dataTable14ColumnEmail,
      cell: ({ row }) => (
        <span className="text-muted">{row.original.email}</span>
      ),
    },
    {
      id: "status",
      header: d.dataTable14ColumnStatus,
      cell: ({ row }) => (
        <StatusPill
          status={row.original.status}
          label={row.original.statusLabel}
        />
      ),
    },
    {
      id: "plan",
      header: d.dataTable14ColumnPlan,
      cell: ({ row }) => (
        <span className="text-muted">{row.original.planLabel}</span>
      ),
    },
    {
      id: "amount",
      header: d.dataTable14ColumnAmount,
      cell: ({ row }) => (
        <span className="font-medium whitespace-nowrap tabular-nums">
          {row.original.amount}
        </span>
      ),
    },
    {
      id: "date",
      header: d.dataTable14ColumnDate,
      cell: ({ row }) => (
        <span className="text-muted whitespace-nowrap">
          {row.original.date}
        </span>
      ),
    },
  ];
}

function handleSearchChange(
  event: ChangeEvent<HTMLInputElement>,
  column: Column<MultiRow, unknown> | undefined,
) {
  const value = event.target.value;
  column?.setFilterValue(value || undefined);
}

function handleStatusChange(
  value: string,
  column: Column<MultiRow, unknown> | undefined,
) {
  column?.setFilterValue(value === "all" ? undefined : value);
}

function handlePlanChange(
  event: ChangeEvent<HTMLSelectElement>,
  column: Column<MultiRow, unknown> | undefined,
) {
  const value = event.target.value;
  column?.setFilterValue(value === "all" ? undefined : value);
}

function handleClearFilters(table: TanTable<MultiRow>) {
  table.resetColumnFilters();
}

function FilterLabel({ children }: { children: string }) {
  return (
    <span className="text-muted mb-1 block text-xs font-medium">
      {children}
    </span>
  );
}

export function MultiFilterDataTable() {
  const t = useMessages("pages") as unknown as PagesWithDataTableMessages;
  const d = t.dataTable;
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const rows = buildRows(d);
  const columns = buildColumns(d);

  const table = useReactTable({
    data: rows,
    columns,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const customerColumn = table.getColumn("customer");
  const statusColumn = table.getColumn("status");
  const planColumn = table.getColumn("plan");
  const searchValue =
    (customerColumn?.getFilterValue() as string | undefined) ?? "";
  const statusValue =
    (statusColumn?.getFilterValue() as string | undefined) ?? "all";
  const planValue =
    (planColumn?.getFilterValue() as string | undefined) ?? "all";
  const hasFilters = columnFilters.length > 0;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {d.dataTable14Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.dataTable14Description}
          </Typography>
        </div>
        <div className="border-border bg-surface flex flex-col gap-4 rounded-xl border p-4 lg:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end">
            <div className="w-full md:w-56">
              <Input
                leftIcon={<IconSearch size={16} />}
                value={searchValue}
                onChange={(event) => handleSearchChange(event, customerColumn)}
                placeholder={d.dataTable14SearchPlaceholder}
                aria-label={d.dataTable14SearchPlaceholder}
              />
            </div>
            <div className="w-full md:w-44">
              <FilterLabel>{d.dataTable14StatusLabel}</FilterLabel>
              <Select
                value={statusValue}
                onValueChange={(value) =>
                  handleStatusChange(value, statusColumn)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={d.dataTable14AllStatuses} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {d.dataTable14AllStatuses}
                  </SelectItem>
                  {STATUS_ORDER.map((status) => (
                    <SelectItem key={status} value={status}>
                      {getStatusLabel(d, status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-44">
              <FilterLabel>{d.dataTable14PlanLabel}</FilterLabel>
              <NativeSelect
                value={planValue}
                onChange={(event) => handlePlanChange(event, planColumn)}
                aria-label={d.dataTable14PlanLabel}
              >
                <option value="all">{d.dataTable14AllPlans}</option>
                {PLAN_ORDER.map((plan) => (
                  <option key={plan} value={plan}>
                    {getPlanLabel(d, plan)}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div>
              <Button
                variant="outline"
                leftIcon={<IconFilterOff size={16} />}
                disabled={!hasFilters}
                onClick={() => handleClearFilters(table)}
              >
                {d.dataTable14ClearFilters}
              </Button>
            </div>
          </div>
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
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
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
                ))
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 p-6 text-center"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <IconInbox
                        size={24}
                        className="text-muted"
                        aria-hidden="true"
                      />
                      <span className="text-muted text-sm">
                        {d.dataTable14NoResults}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
