"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type Table as TanTable,
} from "@tanstack/react-table";
import { IconTrash, IconX } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Checkbox, IndeterminateCheckbox } from "@/components/ui/Checkbox";
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

type DataTableMessages = PagesWithDataTableMessages["dataTable"];

interface SelectRowRef {
  nameKey: string;
  emailKey: string;
  dateKey: string;
  status: StatusValue;
  amount: number;
}

interface SelectRow {
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

const ROW_REFS: SelectRowRef[] = [
  {
    nameKey: "dataTable11Row1Name",
    emailKey: "dataTable11Row1Email",
    dateKey: "dataTable11Row1Date",
    status: "paid",
    amount: 1240,
  },
  {
    nameKey: "dataTable11Row2Name",
    emailKey: "dataTable11Row2Email",
    dateKey: "dataTable11Row2Date",
    status: "pending",
    amount: 860,
  },
  {
    nameKey: "dataTable11Row3Name",
    emailKey: "dataTable11Row3Email",
    dateKey: "dataTable11Row3Date",
    status: "paid",
    amount: 2150,
  },
  {
    nameKey: "dataTable11Row4Name",
    emailKey: "dataTable11Row4Email",
    dateKey: "dataTable11Row4Date",
    status: "failed",
    amount: 430,
  },
  {
    nameKey: "dataTable11Row5Name",
    emailKey: "dataTable11Row5Email",
    dateKey: "dataTable11Row5Date",
    status: "refunded",
    amount: 1980,
  },
  {
    nameKey: "dataTable11Row6Name",
    emailKey: "dataTable11Row6Email",
    dateKey: "dataTable11Row6Date",
    status: "paid",
    amount: 675,
  },
];

function getStatusLabel(d: DataTableMessages, status: StatusValue): string {
  switch (status) {
    case "paid":
      return d.dataTable11StatusPaid;
    case "pending":
      return d.dataTable11StatusPending;
    case "failed":
      return d.dataTable11StatusFailed;
    default:
      return d.dataTable11StatusRefunded;
  }
}

function formatMoney(value: number, currency: string): string {
  return `${currency}${value.toFixed(2)}`;
}

function buildRows(
  d: DataTableMessages,
  deletedIds: ReadonlySet<number>,
): SelectRow[] {
  return ROW_REFS.map((row, index) => ({
    id: index,
    avatarSeed: `dt11-${index + 1}`,
    name: d[row.nameKey],
    email: d[row.emailKey],
    date: d[row.dateKey],
    status: row.status,
    statusLabel: getStatusLabel(d, row.status),
    amount: formatMoney(row.amount, d.dataTable11Currency),
  })).filter((row) => !deletedIds.has(row.id));
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

function buildColumns(d: DataTableMessages): ColumnDef<SelectRow>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <IndeterminateCheckbox
          aria-label={d.dataTable11AriaSelectAll}
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={table.getIsSomePageRowsSelected()}
          onChange={() => handleToggleAllSelected(table)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label={d.dataTable11AriaSelectRow}
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
    },
    {
      id: "customer",
      header: d.dataTable11ColumnCustomer,
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
      header: d.dataTable11ColumnEmail,
      cell: ({ row }) => (
        <span className="text-muted">{row.original.email}</span>
      ),
    },
    {
      id: "status",
      header: d.dataTable11ColumnStatus,
      cell: ({ row }) => (
        <StatusPill
          status={row.original.status}
          label={row.original.statusLabel}
        />
      ),
    },
    {
      id: "amount",
      header: d.dataTable11ColumnAmount,
      cell: ({ row }) => (
        <span className="font-medium whitespace-nowrap tabular-nums">
          {row.original.amount}
        </span>
      ),
    },
    {
      id: "date",
      header: d.dataTable11ColumnDate,
      cell: ({ row }) => (
        <span className="text-muted whitespace-nowrap">
          {row.original.date}
        </span>
      ),
    },
  ];
}

function handleToggleAllSelected(table: TanTable<SelectRow>) {
  table.toggleAllPageRowsSelected(!table.getIsAllPageRowsSelected());
}

function handleDeselectAll(table: TanTable<SelectRow>) {
  table.resetRowSelection();
}

function handleDeleteSelected(
  setDeletedIds: Dispatch<SetStateAction<ReadonlySet<number>>>,
  table: TanTable<SelectRow>,
) {
  const ids = table.getSelectedRowModel().rows.map((row) => row.original.id);
  setDeletedIds((previous) => {
    const next = new Set(previous);
    ids.forEach((id) => next.add(id));
    return next;
  });
  table.resetRowSelection();
}

export function RowSelectionDataTable() {
  const t = useMessages("pages") as unknown as PagesWithDataTableMessages;
  const d = t.dataTable;
  const [deletedIds, setDeletedIds] = useState<ReadonlySet<number>>(
    () => new Set(),
  );
  const rows = buildRows(d, deletedIds);
  const columns = buildColumns(d);

  const table = useReactTable({
    data: rows,
    columns,
    getRowId: (row) => String(row.id),
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
  });

  const selectedCount = table.getSelectedRowModel().rows.length;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {d.dataTable11Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.dataTable11Description}
          </Typography>
        </div>
        <div className="border-border bg-surface flex flex-col gap-4 rounded-xl border p-4 lg:p-6">
          {selectedCount > 0 && (
            <div className="border-border bg-surface flex flex-wrap items-center gap-3 rounded-lg border px-3 py-2">
              <span className="text-sm font-medium">
                {selectedCount} {d.dataTable11Selected}
              </span>
              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<IconX size={16} />}
                  onClick={() => handleDeselectAll(table)}
                >
                  {d.dataTable11DeselectAll}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  leftIcon={<IconTrash size={16} />}
                  onClick={() => handleDeleteSelected(setDeletedIds, table)}
                >
                  {d.dataTable11BulkDelete}
                </Button>
              </div>
            </div>
          )}
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
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() ? "selected" : undefined}
                  >
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
                    className="h-24 text-center"
                  >
                    <span className="text-muted text-sm">
                      {d.dataTable11NoResults}
                    </span>
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
