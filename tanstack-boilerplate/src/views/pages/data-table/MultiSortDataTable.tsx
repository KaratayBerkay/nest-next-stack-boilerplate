"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import {
  IconArrowDown,
  IconArrowUp,
  IconArrowsSort,
  IconX,
} from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDataTableMessages } from "@/types/pages/data-table/DataTableMessages-types";
import type { Dispatch, SetStateAction } from "react";

interface MultiSortRowSeed {
  id: string;
  nameKey: string;
  dateKey: string;
  amount: number;
  statusKey: string;
}

interface MultiSortRow {
  id: string;
  name: string;
  date: string;
  amount: number;
  statusKey: string;
}

const MULTI_SORT_ROWS: MultiSortRowSeed[] = [
  {
    id: "m1",
    nameKey: "dataTable32Row1Name",
    dateKey: "dataTable32Row1Date",
    amount: 1290,
    statusKey: "dataTable32Status1",
  },
  {
    id: "m2",
    nameKey: "dataTable32Row2Name",
    dateKey: "dataTable32Row2Date",
    amount: 84.5,
    statusKey: "dataTable32Status2",
  },
  {
    id: "m3",
    nameKey: "dataTable32Row3Name",
    dateKey: "dataTable32Row3Date",
    amount: 340,
    statusKey: "dataTable32Status3",
  },
  {
    id: "m4",
    nameKey: "dataTable32Row4Name",
    dateKey: "dataTable32Row4Date",
    amount: 76.9,
    statusKey: "dataTable32Status1",
  },
  {
    id: "m5",
    nameKey: "dataTable32Row5Name",
    dateKey: "dataTable32Row5Date",
    amount: 512.6,
    statusKey: "dataTable32Status2",
  },
];

const STATUS_PILL_CLASSES: Record<string, string> = {
  dataTable32Status1: "bg-success/10 text-success",
  dataTable32Status2: "bg-warning/10 text-warning",
  dataTable32Status3: "bg-error/10 text-error",
};

const SORT_LABEL_KEYS: Record<string, string> = {
  name: "dataTable32ColName",
  date: "dataTable32ColDate",
  amount: "dataTable32ColAmount",
  status: "dataTable32ColStatus",
};

// Plain clicks stack into multi-sort (no Shift needed) via `isMultiSortEvent`.
function multiSortEvent() {
  return true;
}

function removeSort(
  columnId: string,
  setSorting: Dispatch<SetStateAction<SortingState>>,
) {
  setSorting((prev) => prev.filter((sort) => sort.id !== columnId));
}

function clearSorting(setSorting: Dispatch<SetStateAction<SortingState>>) {
  setSorting([]);
}

export function MultiSortDataTable() {
  const t = useMessages("pages") as unknown as PagesWithDataTableMessages;
  const d = t.dataTable;

  const [sorting, setSorting] = useState<SortingState>([]);

  const data: MultiSortRow[] = MULTI_SORT_ROWS.map((row) => ({
    ...row,
    name: d[row.nameKey],
    date: d[row.dateKey],
  }));

  const columns: ColumnDef<MultiSortRow>[] = [
    {
      accessorKey: "name",
      header: () => d.dataTable32ColName,
    },
    {
      accessorKey: "date",
      header: () => d.dataTable32ColDate,
    },
    {
      accessorKey: "amount",
      header: () => d.dataTable32ColAmount,
    },
    {
      accessorKey: "statusKey",
      header: () => d.dataTable32ColStatus,
      cell: ({ getValue }) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_PILL_CLASSES[getValue<string>()]}`}
        >
          {d[getValue<string>()]}
        </span>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    enableMultiSort: true,
    isMultiSortEvent: multiSortEvent,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {d.dataTable32Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.dataTable32TabDescription}
          </Typography>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-muted text-xs">{d.dataTable32Hint}</span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted text-sm">
              {d.dataTable32ActiveSorts}
            </span>
            {sorting.map((sort) => (
              <span
                key={sort.id}
                className="bg-surface border-border inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium shadow-xs"
              >
                {d[SORT_LABEL_KEYS[sort.id]]}
                {sort.desc ? (
                  <IconArrowDown size={14} className="text-muted" />
                ) : (
                  <IconArrowUp size={14} className="text-muted" />
                )}
                <button
                  type="button"
                  aria-label={d.dataTable32RemoveSort}
                  onClick={() => removeSort(sort.id, setSorting)}
                  className="text-muted hover:text-fg"
                >
                  <IconX size={14} />
                </button>
              </span>
            ))}
            {sorting.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearSorting(setSorting)}
              >
                {d.dataTable32Clear}
              </Button>
            )}
          </div>

          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const sorted = header.column.getIsSorted();
                    const sortIndex = sorting.findIndex(
                      (sort) => sort.id === header.column.id,
                    );
                    return (
                      <TableHead
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className="hover:text-fg cursor-pointer select-none"
                      >
                        <span className="inline-flex items-center gap-1.5">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {sorted === "asc" ? (
                            <IconArrowUp size={14} />
                          ) : sorted === "desc" ? (
                            <IconArrowDown size={14} />
                          ) : (
                            <IconArrowsSort size={14} className="text-muted" />
                          )}
                          {sortIndex >= 0 && (
                            <span className="bg-brand/10 text-brand rounded-full px-1.5 text-[10px] font-semibold">
                              {sortIndex + 1}
                            </span>
                          )}
                        </span>
                      </TableHead>
                    );
                  })}
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
