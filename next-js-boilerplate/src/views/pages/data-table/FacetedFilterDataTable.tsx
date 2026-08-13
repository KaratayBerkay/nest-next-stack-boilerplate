"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type Row,
} from "@tanstack/react-table";
import { IconFilter, IconInbox, IconX } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
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

type DataTableMessages = PagesWithDataTableMessages["dataTable"];

interface FacetedRowRef {
  nameKey: string;
  emailKey: string;
  dateKey: string;
  status: StatusValue;
  amount: number;
}

interface FacetedRow {
  id: number;
  avatarSeed: string;
  name: string;
  email: string;
  date: string;
  status: StatusValue;
  statusLabel: string;
  amount: string;
}

const STATUS_PILL_CLASSES: Record<StatusValue, string> = {
  paid: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  failed: "bg-error/10 text-error",
  refunded: "bg-info/10 text-info",
};

const ROW_REFS: FacetedRowRef[] = [
  {
    nameKey: "dataTable12Row1Name",
    emailKey: "dataTable12Row1Email",
    dateKey: "dataTable12Row1Date",
    status: "paid",
    amount: 1240,
  },
  {
    nameKey: "dataTable12Row2Name",
    emailKey: "dataTable12Row2Email",
    dateKey: "dataTable12Row2Date",
    status: "pending",
    amount: 860,
  },
  {
    nameKey: "dataTable12Row3Name",
    emailKey: "dataTable12Row3Email",
    dateKey: "dataTable12Row3Date",
    status: "paid",
    amount: 2150,
  },
  {
    nameKey: "dataTable12Row4Name",
    emailKey: "dataTable12Row4Email",
    dateKey: "dataTable12Row4Date",
    status: "failed",
    amount: 430,
  },
  {
    nameKey: "dataTable12Row5Name",
    emailKey: "dataTable12Row5Email",
    dateKey: "dataTable12Row5Date",
    status: "refunded",
    amount: 1980,
  },
  {
    nameKey: "dataTable12Row6Name",
    emailKey: "dataTable12Row6Email",
    dateKey: "dataTable12Row6Date",
    status: "paid",
    amount: 675,
  },
];

function getStatusLabel(d: DataTableMessages, status: StatusValue): string {
  switch (status) {
    case "paid":
      return d.dataTable12StatusPaid;
    case "pending":
      return d.dataTable12StatusPending;
    case "failed":
      return d.dataTable12StatusFailed;
    default:
      return d.dataTable12StatusRefunded;
  }
}

function formatMoney(value: number, currency: string): string {
  return `${currency}${value.toFixed(2)}`;
}

function buildRows(d: DataTableMessages): FacetedRow[] {
  return ROW_REFS.map((row, index) => ({
    id: index,
    avatarSeed: `dt12-${index + 1}`,
    name: d[row.nameKey],
    email: d[row.emailKey],
    date: d[row.dateKey],
    status: row.status,
    statusLabel: getStatusLabel(d, row.status),
    amount: formatMoney(row.amount, d.dataTable12Currency),
  }));
}

function getUniqueStatuses(rows: FacetedRow[]): StatusValue[] {
  const seen: StatusValue[] = [];
  rows.forEach((row) => {
    if (!seen.includes(row.status)) seen.push(row.status);
  });
  return seen;
}

function countByStatus(rows: FacetedRow[], status: StatusValue): number {
  return rows.filter((row) => row.status === status).length;
}

function equalsAnyFilter(
  row: Row<FacetedRow>,
  columnId: string,
  filterValue: StatusValue[] | undefined,
): boolean {
  if (!filterValue || filterValue.length === 0) return true;
  return filterValue.includes(row.getValue(columnId));
}

function handleFacetToggle(
  value: StatusValue,
  column: Column<FacetedRow, unknown> | undefined,
) {
  if (!column) return;
  const current = (column.getFilterValue() as StatusValue[] | undefined) ?? [];
  const next = current.includes(value)
    ? current.filter((status) => status !== value)
    : [...current, value];
  column.setFilterValue(next.length > 0 ? next : undefined);
}

function handleFacetClear(column: Column<FacetedRow, unknown> | undefined) {
  column?.setFilterValue(undefined);
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

function buildColumns(d: DataTableMessages): ColumnDef<FacetedRow>[] {
  return [
    {
      id: "customer",
      header: d.dataTable12ColumnCustomer,
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
      header: d.dataTable12ColumnEmail,
      cell: ({ row }) => (
        <span className="text-muted">{row.original.email}</span>
      ),
    },
    {
      id: "status",
      header: d.dataTable12ColumnStatus,
      filterFn: equalsAnyFilter,
      cell: ({ row }) => (
        <StatusPill
          status={row.original.status}
          label={row.original.statusLabel}
        />
      ),
    },
    {
      id: "amount",
      header: d.dataTable12ColumnAmount,
      cell: ({ row }) => (
        <span className="font-medium whitespace-nowrap tabular-nums">
          {row.original.amount}
        </span>
      ),
    },
    {
      id: "date",
      header: d.dataTable12ColumnDate,
      cell: ({ row }) => (
        <span className="text-muted whitespace-nowrap">
          {row.original.date}
        </span>
      ),
    },
  ];
}

export function FacetedFilterDataTable() {
  const t = useMessages("pages") as unknown as PagesWithDataTableMessages;
  const d = t.dataTable;
  const rows = buildRows(d);
  const columns = buildColumns(d);
  const statuses = getUniqueStatuses(rows);

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const statusColumn = table.getColumn("status");
  const selectedStatuses =
    (statusColumn?.getFilterValue() as StatusValue[] | undefined) ?? [];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {d.dataTable12Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.dataTable12Description}
          </Typography>
        </div>
        <div className="border-border bg-surface flex flex-col gap-4 rounded-xl border p-4 lg:p-6">
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<IconFilter size={16} />}
                >
                  {d.dataTable12StatusLabel}
                  {selectedStatuses.length > 0 && (
                    <span className="text-muted">
                      ({selectedStatuses.length})
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-60">
                <DropdownMenuLabel>
                  {d.dataTable12StatusLabel}
                </DropdownMenuLabel>
                {statuses.map((status) => {
                  const checked = selectedStatuses.includes(status);
                  return (
                    <DropdownMenuItem
                      key={status}
                      onClick={(event) => event.preventDefault()}
                    >
                      <div className="flex w-full items-center gap-3">
                        <Checkbox
                          checked={checked}
                          onChange={() =>
                            handleFacetToggle(status, statusColumn)
                          }
                          label={getStatusLabel(d, status)}
                        />
                        <span className="text-muted ml-auto text-xs tabular-nums">
                          {countByStatus(rows, status)}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleFacetClear(statusColumn)}
                >
                  <IconX size={14} aria-hidden="true" />
                  {d.dataTable12Clear}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                        {d.dataTable12NoResults}
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
