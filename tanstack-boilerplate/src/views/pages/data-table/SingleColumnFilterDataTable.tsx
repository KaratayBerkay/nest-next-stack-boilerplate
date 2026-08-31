"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type Header,
  type SortingState,
  type Updater,
} from "@tanstack/react-table";
import {
  useMemo,
  useState,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import {
  IconArrowDown,
  IconArrowUp,
  IconArrowsSort,
  IconSearch,
} from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDataTableMessages } from "@/types/pages/data-table/DataTableMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

type CustomerTone = "success" | "warning" | "error" | "info";

const PILL_TONES: Record<CustomerTone, string> = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  error: "bg-error/10 text-error",
  info: "bg-info/10 text-info",
};

const PLAN_OPTIONS = [
  { planKey: "dataTable8PlanStarter", sortPlan: "starter" },
  { planKey: "dataTable8PlanPro", sortPlan: "pro" },
  { planKey: "dataTable8PlanEnterprise", sortPlan: "enterprise" },
] as const;

const STATUS_OPTIONS = [
  {
    statusKey: "dataTable8StatusActive",
    sortStatus: "active",
    tone: "success",
  },
  { statusKey: "dataTable8StatusTrial", sortStatus: "trial", tone: "info" },
  {
    statusKey: "dataTable8StatusCancelled",
    sortStatus: "cancelled",
    tone: "error",
  },
] as const;

interface FilterCustomerRow {
  avatarSeed: string;
  nameKey: string;
  sortName: string;
  emailKey: string;
  planKey: string;
  sortPlan: string;
  statusKey: string;
  sortStatus: string;
  tone: CustomerTone;
}

function customer(
  index: number,
  sortName: string,
  emailKey: string,
): FilterCustomerRow {
  const plan = PLAN_OPTIONS[index % PLAN_OPTIONS.length];
  const status = STATUS_OPTIONS[index % STATUS_OPTIONS.length];
  return {
    avatarSeed: `data-table-8-customer-${index}`,
    nameKey: `dataTable8Name${index}`,
    sortName,
    emailKey,
    planKey: plan.planKey,
    sortPlan: plan.sortPlan,
    statusKey: status.statusKey,
    sortStatus: status.sortStatus,
    tone: status.tone,
  };
}

const FILTER_CUSTOMERS: FilterCustomerRow[] = [
  customer(1, "Liam Turner", "dataTable8Email1"),
  customer(2, "Olivia Reed", "dataTable8Email2"),
  customer(3, "Noah Bennett", "dataTable8Email3"),
  customer(4, "Emma Cooper", "dataTable8Email4"),
  customer(5, "Mason Gray", "dataTable8Email5"),
  customer(6, "Ava Morgan", "dataTable8Email6"),
  customer(7, "Lucas Ward", "dataTable8Email7"),
  customer(8, "Mia Foster", "dataTable8Email8"),
  customer(9, "Ethan Bailey", "dataTable8Email9"),
  customer(10, "Isla Parker", "dataTable8Email10"),
  customer(11, "James Fisher", "dataTable8Email11"),
  customer(12, "Zara Cole", "dataTable8Email12"),
];

function handleSortingChange(
  updater: Updater<SortingState>,
  setSorting: Dispatch<SetStateAction<SortingState>>,
) {
  setSorting(updater);
}

function handleFilterChange(
  e: ChangeEvent<HTMLInputElement>,
  column: Column<FilterCustomerRow, unknown> | undefined,
) {
  column?.setFilterValue(e.target.value);
}

function StatusPill({ label, tone }: { label: string; tone: CustomerTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        PILL_TONES[tone],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

function SortHeader({
  header,
  label,
}: {
  header: Header<FilterCustomerRow, unknown>;
  label: string;
}) {
  const sorted = header.column.getIsSorted();
  return (
    <button
      type="button"
      onClick={header.column.getToggleSortingHandler()}
      className={cn(
        "hover:text-fg inline-flex cursor-pointer items-center gap-1 select-none",
        sorted ? "text-fg" : "text-muted",
      )}
    >
      {label}
      {sorted === "asc" ? (
        <IconArrowUp size={14} className="shrink-0" />
      ) : sorted === "desc" ? (
        <IconArrowDown size={14} className="shrink-0" />
      ) : (
        <IconArrowsSort size={14} className="text-muted shrink-0" />
      )}
    </button>
  );
}

function buildColumns(
  d: Record<string, string>,
): ColumnDef<FilterCustomerRow>[] {
  return [
    {
      accessorKey: "sortName",
      header: ({ header }) => (
        <SortHeader header={header} label={d.dataTable8ColName} />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={placeholderImage(row.original.avatarSeed, "1x1")}
            fallback=""
            size="sm"
          />
          <span className="font-medium whitespace-nowrap">
            {d[row.original.nameKey]}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "emailKey",
      enableSorting: false,
      header: d.dataTable8ColEmail,
      cell: ({ row }) => (
        <span className="text-muted whitespace-nowrap">
          {d[row.original.emailKey]}
        </span>
      ),
    },
    {
      accessorKey: "sortPlan",
      header: ({ header }) => (
        <SortHeader header={header} label={d.dataTable8ColPlan} />
      ),
      cell: ({ row }) => (
        <span className="whitespace-nowrap">{d[row.original.planKey]}</span>
      ),
    },
    {
      accessorKey: "sortStatus",
      enableSorting: false,
      header: d.dataTable8ColStatus,
      cell: ({ row }) => (
        <StatusPill
          label={d[row.original.statusKey]}
          tone={row.original.tone}
        />
      ),
    },
  ];
}

export function SingleColumnFilterDataTable() {
  const t = useMessages("pages") as unknown as PagesWithDataTableMessages;
  const d = t.dataTable;
  const [sorting, setSorting] = useState<SortingState>([]);
  const columns = useMemo(() => buildColumns(d), [d]);

  const table = useReactTable({
    data: FILTER_CUSTOMERS,
    columns,
    state: { sorting },
    onSortingChange: (updater) => handleSortingChange(updater, setSorting),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const rows = table.getRowModel().rows;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-10 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col items-center gap-3 text-center">
          <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
            {d.dataTable8Heading}
          </h2>
          <p className="text-muted text-lg">{d.dataTable8Description}</p>
        </div>
        <div className="bg-surface border-border w-full rounded-xl border shadow-xs">
          <div className="flex flex-col gap-3 p-4">
            <div className="relative max-w-sm">
              <IconSearch
                size={16}
                className="text-muted absolute top-1/2 left-3 -translate-y-1/2"
              />
              <Input
                placeholder={d.dataTable8SearchPlaceholder}
                value={
                  (table.getColumn("sortName")?.getFilterValue() as string) ??
                  ""
                }
                onChange={(e) =>
                  handleFilterChange(e, table.getColumn("sortName"))
                }
                className="pl-9"
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
                {rows.length ? (
                  rows.map((row) => (
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
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      <span className="text-muted">
                        {d.dataTable8NoResults}
                      </span>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </section>
  );
}
