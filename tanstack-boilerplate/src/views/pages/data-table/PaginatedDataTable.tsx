"use client";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type Header,
  type SortingState,
  type Updater,
} from "@tanstack/react-table";
import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
  IconArrowDown,
  IconArrowUp,
  IconArrowsSort,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDataTableMessages } from "@/types/pages/data-table/DataTableMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

const PAGE_SIZE = 8 as const;

type CustomerTone = "success" | "warning" | "error" | "info";

const PILL_TONES: Record<CustomerTone, string> = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  error: "bg-error/10 text-error",
  info: "bg-info/10 text-info",
};

const PLAN_OPTIONS = [
  { planKey: "dataTable6PlanStarter", sortPlan: "starter" },
  { planKey: "dataTable6PlanPro", sortPlan: "pro" },
  { planKey: "dataTable6PlanEnterprise", sortPlan: "enterprise" },
] as const;

const STATUS_OPTIONS = [
  {
    statusKey: "dataTable6StatusActive",
    sortStatus: "active",
    tone: "success",
  },
  { statusKey: "dataTable6StatusTrial", sortStatus: "trial", tone: "info" },
  {
    statusKey: "dataTable6StatusCancelled",
    sortStatus: "cancelled",
    tone: "error",
  },
] as const;

interface CustomerRow {
  avatarSeed: string;
  nameKey: string;
  sortName: string;
  emailKey: string;
  planKey: string;
  sortPlan: string;
  statusKey: string;
  sortStatus: string;
  tone: CustomerTone;
  amountKey: string;
  amount: number;
}

function customer(
  index: number,
  sortName: string,
  emailKey: string,
  amountKey: string,
  amount: number,
): CustomerRow {
  const plan = PLAN_OPTIONS[index % PLAN_OPTIONS.length];
  const status = STATUS_OPTIONS[index % STATUS_OPTIONS.length];
  return {
    avatarSeed: `data-table-6-customer-${index}`,
    nameKey: `dataTable6Name${index}`,
    sortName,
    emailKey,
    planKey: plan.planKey,
    sortPlan: plan.sortPlan,
    statusKey: status.statusKey,
    sortStatus: status.sortStatus,
    tone: status.tone,
    amountKey,
    amount,
  };
}

const PAGINATED_CUSTOMERS: CustomerRow[] = [
  customer(1, "Olivia Martin", "dataTable6Email1", "dataTable6Amount1", 49),
  customer(2, "James Wilson", "dataTable6Email2", "dataTable6Amount2", 199),
  customer(3, "Sophia Davis", "dataTable6Email3", "dataTable6Amount3", 0),
  customer(4, "Benjamin Garcia", "dataTable6Email4", "dataTable6Amount4", 199),
  customer(5, "Ava Rodriguez", "dataTable6Email5", "dataTable6Amount5", 49),
  customer(6, "Lucas Anderson", "dataTable6Email6", "dataTable6Amount6", 799),
  customer(7, "Mia Thomas", "dataTable6Email7", "dataTable6Amount7", 0),
  customer(8, "Henry Jackson", "dataTable6Email8", "dataTable6Amount8", 0),
  customer(9, "Amelia White", "dataTable6Email9", "dataTable6Amount9", 199),
  customer(10, "Elijah Harris", "dataTable6Email10", "dataTable6Amount10", 49),
  customer(
    11,
    "Charlotte Clark",
    "dataTable6Email11",
    "dataTable6Amount11",
    799,
  ),
  customer(12, "Alexander Lewis", "dataTable6Email12", "dataTable6Amount12", 0),
  customer(13, "Harper Robinson", "dataTable6Email13", "dataTable6Amount13", 0),
  customer(14, "Daniel Walker", "dataTable6Email14", "dataTable6Amount14", 199),
  customer(15, "Evelyn Hall", "dataTable6Email15", "dataTable6Amount15", 0),
  customer(16, "Michael Young", "dataTable6Email16", "dataTable6Amount16", 799),
];

function goToPage(
  page: number,
  totalPages: number,
  setPageIndex: Dispatch<SetStateAction<number>>,
) {
  setPageIndex(Math.min(Math.max(0, page), totalPages - 1));
}

function handleSortingChange(
  updater: Updater<SortingState>,
  setSorting: Dispatch<SetStateAction<SortingState>>,
  setPageIndex: Dispatch<SetStateAction<number>>,
) {
  setSorting(updater);
  setPageIndex(0);
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
  header: Header<CustomerRow, unknown>;
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

function PageButton({
  page,
  totalPages,
  setPageIndex,
  variant,
  leftIcon,
  rightIcon,
  children,
}: {
  page: number;
  totalPages: number;
  setPageIndex: Dispatch<SetStateAction<number>>;
  variant?: "outline" | "primary";
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant={variant ?? "outline"}
      size="sm"
      className="!rounded-full"
      disabled={page < 0 || page >= totalPages}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      onClick={() => goToPage(page, totalPages, setPageIndex)}
    >
      {children}
    </Button>
  );
}

function buildColumns(d: Record<string, string>): ColumnDef<CustomerRow>[] {
  return [
    {
      accessorKey: "sortName",
      header: ({ header }) => (
        <SortHeader header={header} label={d.dataTable6ColName} />
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
      header: d.dataTable6ColEmail,
      cell: ({ row }) => (
        <span className="text-muted whitespace-nowrap">
          {d[row.original.emailKey]}
        </span>
      ),
    },
    {
      accessorKey: "sortPlan",
      header: ({ header }) => (
        <SortHeader header={header} label={d.dataTable6ColPlan} />
      ),
      cell: ({ row }) => (
        <span className="whitespace-nowrap">{d[row.original.planKey]}</span>
      ),
    },
    {
      accessorKey: "sortStatus",
      enableSorting: false,
      header: d.dataTable6ColStatus,
      cell: ({ row }) => (
        <StatusPill
          label={d[row.original.statusKey]}
          tone={row.original.tone}
        />
      ),
    },
    {
      accessorKey: "amount",
      header: ({ header }) => (
        <SortHeader header={header} label={d.dataTable6ColAmount} />
      ),
      cell: ({ row }) => (
        <span className="font-medium whitespace-nowrap">
          {d[row.original.amountKey]}
        </span>
      ),
    },
  ];
}

export function PaginatedDataTable() {
  const t = useMessages("pages") as unknown as PagesWithDataTableMessages;
  const d = t.dataTable;
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const columns = useMemo(() => buildColumns(d), [d]);

  const table = useReactTable({
    data: PAGINATED_CUSTOMERS,
    columns,
    state: { sorting },
    onSortingChange: (updater) =>
      handleSortingChange(updater, setSorting, setPageIndex),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const sortedRows = table.getSortedRowModel().rows;
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
  const safePageIndex = Math.min(pageIndex, totalPages - 1);
  const pageRows = sortedRows.slice(
    safePageIndex * PAGE_SIZE,
    safePageIndex * PAGE_SIZE + PAGE_SIZE,
  );
  const from = safePageIndex * PAGE_SIZE + 1;
  const to = safePageIndex * PAGE_SIZE + pageRows.length;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-10 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col items-center gap-3 text-center">
          <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
            {d.dataTable6Heading}
          </h2>
          <p className="text-muted text-lg">{d.dataTable6Description}</p>
        </div>
        <div className="bg-surface border-border w-full overflow-hidden rounded-xl border shadow-xs">
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
              {pageRows.map((row) => (
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
          <div className="flex flex-col items-center justify-between gap-4 border-t p-4 sm:flex-row">
            <p className="text-muted text-sm">
              {d.dataTable6ShowingText} {from}–{to} {d.dataTable6OfText}{" "}
              {sortedRows.length}
            </p>
            <div className="flex items-center gap-1.5">
              <PageButton
                page={safePageIndex - 1}
                totalPages={totalPages}
                setPageIndex={setPageIndex}
                leftIcon={<IconChevronLeft size={16} />}
              >
                {d.dataTable6Prev}
              </PageButton>
              {Array.from({ length: totalPages }, (_, i) => i).map((page) => (
                <PageButton
                  key={page}
                  page={page}
                  totalPages={totalPages}
                  setPageIndex={setPageIndex}
                  variant={page === safePageIndex ? "primary" : "outline"}
                >
                  {page + 1}
                </PageButton>
              ))}
              <PageButton
                page={safePageIndex + 1}
                totalPages={totalPages}
                setPageIndex={setPageIndex}
                rightIcon={<IconChevronRight size={16} />}
              >
                {d.dataTable6Next}
              </PageButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
