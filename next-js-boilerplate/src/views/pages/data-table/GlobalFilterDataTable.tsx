"use client";

import { useState } from "react";
import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { IconInbox, IconSearch } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
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

interface GlobalFilterRowRef {
  nameKey: string;
  emailKey: string;
  dateKey: string;
  status: StatusValue;
  amount: number;
}

interface GlobalFilterRow {
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

const ROW_REFS: GlobalFilterRowRef[] = [
  {
    nameKey: "dataTable9Row1Name",
    emailKey: "dataTable9Row1Email",
    dateKey: "dataTable9Row1Date",
    status: "paid",
    amount: 1240,
  },
  {
    nameKey: "dataTable9Row2Name",
    emailKey: "dataTable9Row2Email",
    dateKey: "dataTable9Row2Date",
    status: "pending",
    amount: 860,
  },
  {
    nameKey: "dataTable9Row3Name",
    emailKey: "dataTable9Row3Email",
    dateKey: "dataTable9Row3Date",
    status: "paid",
    amount: 2150,
  },
  {
    nameKey: "dataTable9Row4Name",
    emailKey: "dataTable9Row4Email",
    dateKey: "dataTable9Row4Date",
    status: "failed",
    amount: 430,
  },
  {
    nameKey: "dataTable9Row5Name",
    emailKey: "dataTable9Row5Email",
    dateKey: "dataTable9Row5Date",
    status: "refunded",
    amount: 1980,
  },
  {
    nameKey: "dataTable9Row6Name",
    emailKey: "dataTable9Row6Email",
    dateKey: "dataTable9Row6Date",
    status: "paid",
    amount: 675,
  },
];

function getStatusLabel(d: DataTableMessages, status: StatusValue): string {
  switch (status) {
    case "paid":
      return d.dataTable9StatusPaid;
    case "pending":
      return d.dataTable9StatusPending;
    case "failed":
      return d.dataTable9StatusFailed;
    default:
      return d.dataTable9StatusRefunded;
  }
}

function formatMoney(value: number, currency: string): string {
  return `${currency}${value.toFixed(2)}`;
}

function buildRows(d: DataTableMessages): GlobalFilterRow[] {
  return ROW_REFS.map((row, index) => ({
    id: index,
    avatarSeed: `dt9-${index + 1}`,
    name: d[row.nameKey],
    email: d[row.emailKey],
    date: d[row.dateKey],
    status: row.status,
    statusLabel: getStatusLabel(d, row.status),
    amount: formatMoney(row.amount, d.dataTable9Currency),
  }));
}

function CustomerCell({ row }: { row: GlobalFilterRow }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar
        src={`https://picsum.photos/seed/${row.avatarSeed}/64/64`}
        alt={row.name}
        fallback={row.name}
        size="sm"
      />
      <span className="font-medium">{row.name}</span>
    </div>
  );
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

function buildColumns(d: DataTableMessages): ColumnDef<GlobalFilterRow>[] {
  return [
    {
      id: "customer",
      header: d.dataTable9ColumnCustomer,
      cell: ({ row }) => <CustomerCell row={row.original} />,
    },
    {
      id: "email",
      header: d.dataTable9ColumnEmail,
      cell: ({ row }) => (
        <span className="text-muted">{row.original.email}</span>
      ),
    },
    {
      id: "status",
      header: d.dataTable9ColumnStatus,
      cell: ({ row }) => (
        <StatusPill
          status={row.original.status}
          label={row.original.statusLabel}
        />
      ),
    },
    {
      id: "amount",
      header: d.dataTable9ColumnAmount,
      cell: ({ row }) => (
        <span className="font-medium whitespace-nowrap tabular-nums">
          {row.original.amount}
        </span>
      ),
    },
    {
      id: "date",
      header: d.dataTable9ColumnDate,
      cell: ({ row }) => (
        <span className="text-muted whitespace-nowrap">
          {row.original.date}
        </span>
      ),
    },
  ];
}

function handleGlobalSearchChange(
  event: ChangeEvent<HTMLInputElement>,
  setGlobalFilter: Dispatch<SetStateAction<string>>,
) {
  setGlobalFilter(event.target.value);
}

export function GlobalFilterDataTable() {
  const t = useMessages("pages") as unknown as PagesWithDataTableMessages;
  const d = t.dataTable;
  const rows = buildRows(d);
  const columns = buildColumns(d);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data: rows,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {d.dataTable9Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.dataTable9Description}
          </Typography>
        </div>
        <div className="border-border bg-surface flex flex-col gap-4 rounded-xl border p-4 lg:p-6">
          <div className="max-w-sm">
            <Input
              leftIcon={<IconSearch size={16} />}
              value={globalFilter}
              onChange={(event) =>
                handleGlobalSearchChange(event, setGlobalFilter)
              }
              placeholder={d.dataTable9SearchPlaceholder}
              aria-label={d.dataTable9SearchPlaceholder}
            />
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
                        {d.dataTable9NoResults}
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
