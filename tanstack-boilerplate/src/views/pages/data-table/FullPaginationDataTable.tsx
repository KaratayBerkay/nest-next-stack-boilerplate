"use client";

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type Header,
  type PaginationState,
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
import { Button } from "@/components/ui/Button";
import { NativeSelect } from "@/components/ui/NativeSelect";
import {
  IconArrowDown,
  IconArrowUp,
  IconArrowsSort,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
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
  { planKey: "dataTable7PlanStarter", sortPlan: "starter" },
  { planKey: "dataTable7PlanPro", sortPlan: "pro" },
  { planKey: "dataTable7PlanEnterprise", sortPlan: "enterprise" },
] as const;

const STATUS_OPTIONS = [
  {
    statusKey: "dataTable7StatusActive",
    sortStatus: "active",
    tone: "success",
  },
  { statusKey: "dataTable7StatusTrial", sortStatus: "trial", tone: "info" },
  {
    statusKey: "dataTable7StatusCancelled",
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
    avatarSeed: `data-table-7-customer-${index}`,
    nameKey: `dataTable7Name${index}`,
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

const FULL_CUSTOMERS: CustomerRow[] = [
  customer(1, "Alice Johnson", "dataTable7Email1", "dataTable7Amount1", 49),
  customer(2, "Bob Smith", "dataTable7Email2", "dataTable7Amount2", 0),
  customer(3, "Charlie Brown", "dataTable7Email3", "dataTable7Amount3", 199),
  customer(4, "Diana Prince", "dataTable7Email4", "dataTable7Amount4", 799),
  customer(5, "Ethan Hunt", "dataTable7Email5", "dataTable7Amount5", 0),
  customer(6, "Fiona Davis", "dataTable7Email6", "dataTable7Amount6", 0),
  customer(7, "George Miller", "dataTable7Email7", "dataTable7Amount7", 99),
  customer(8, "Hannah Scott", "dataTable7Email8", "dataTable7Amount8", 0),
  customer(9, "Ian Turner", "dataTable7Email9", "dataTable7Amount9", 199),
  customer(10, "Julia Adams", "dataTable7Email10", "dataTable7Amount10", 199),
  customer(11, "Kevin Parker", "dataTable7Email11", "dataTable7Amount11", 49),
  customer(12, "Laura Bennett", "dataTable7Email12", "dataTable7Amount12", 0),
  customer(13, "Mason Cooper", "dataTable7Email13", "dataTable7Amount13", 0),
  customer(14, "Nina Foster", "dataTable7Email14", "dataTable7Amount14", 49),
  customer(15, "Oscar Reed", "dataTable7Email15", "dataTable7Amount15", 799),
  customer(16, "Paula Morgan", "dataTable7Email16", "dataTable7Amount16", 199),
  customer(17, "Quinn Bailey", "dataTable7Email17", "dataTable7Amount17", 0),
  customer(18, "Rachel Gray", "dataTable7Email18", "dataTable7Amount18", 49),
  customer(19, "Samuel Ward", "dataTable7Email19", "dataTable7Amount19", 0),
  customer(20, "Tina Fisher", "dataTable7Email20", "dataTable7Amount20", 49),
  customer(21, "Umar Khan", "dataTable7Email21", "dataTable7Amount21", 0),
  customer(22, "Vera Cole", "dataTable7Email22", "dataTable7Amount22", 0),
  customer(23, "Walter Nash", "dataTable7Email23", "dataTable7Amount23", 199),
  customer(24, "Zoe Brooks", "dataTable7Email24", "dataTable7Amount24", 49),
];

function jumpToPage(
  page: number,
  pageCount: number,
  setPagination: Dispatch<SetStateAction<PaginationState>>,
) {
  setPagination((prev) => ({
    ...prev,
    pageIndex: Math.min(Math.max(0, page), pageCount - 1),
  }));
}

function handleSortingChange(
  updater: Updater<SortingState>,
  setSorting: Dispatch<SetStateAction<SortingState>>,
  setPagination: Dispatch<SetStateAction<PaginationState>>,
) {
  setSorting(updater);
  setPagination((prev) => ({ ...prev, pageIndex: 0 }));
}

function handlePageSizeChange(
  e: ChangeEvent<HTMLSelectElement>,
  setPagination: Dispatch<SetStateAction<PaginationState>>,
) {
  setPagination((prev) => ({
    ...prev,
    pageSize: Number(e.target.value),
    pageIndex: 0,
  }));
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
  pageCount,
  setPagination,
  variant,
  leftIcon,
  rightIcon,
  children,
}: {
  page: number;
  pageCount: number;
  setPagination: Dispatch<SetStateAction<PaginationState>>;
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
      disabled={page < 0 || page >= pageCount}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      onClick={() => jumpToPage(page, pageCount, setPagination)}
    >
      {children}
    </Button>
  );
}

function PageSizeSelect({
  pageSize,
  setPagination,
  sizeLabels,
}: {
  pageSize: number;
  setPagination: Dispatch<SetStateAction<PaginationState>>;
  sizeLabels: string[];
}) {
  return (
    <NativeSelect
      className="h-8 w-[74px] text-xs"
      value={String(pageSize)}
      onChange={(e) => handlePageSizeChange(e, setPagination)}
    >
      {sizeLabels.map((label) => (
        <option key={label} value={label}>
          {label}
        </option>
      ))}
    </NativeSelect>
  );
}

function buildColumns(d: Record<string, string>): ColumnDef<CustomerRow>[] {
  return [
    {
      accessorKey: "sortName",
      header: ({ header }) => (
        <SortHeader header={header} label={d.dataTable7ColName} />
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
      header: d.dataTable7ColEmail,
      cell: ({ row }) => (
        <span className="text-muted whitespace-nowrap">
          {d[row.original.emailKey]}
        </span>
      ),
    },
    {
      accessorKey: "sortPlan",
      header: ({ header }) => (
        <SortHeader header={header} label={d.dataTable7ColPlan} />
      ),
      cell: ({ row }) => (
        <span className="whitespace-nowrap">{d[row.original.planKey]}</span>
      ),
    },
    {
      accessorKey: "sortStatus",
      enableSorting: false,
      header: d.dataTable7ColStatus,
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
        <SortHeader header={header} label={d.dataTable7ColAmount} />
      ),
      cell: ({ row }) => (
        <span className="font-medium whitespace-nowrap">
          {d[row.original.amountKey]}
        </span>
      ),
    },
  ];
}

export function FullPaginationDataTable() {
  const t = useMessages("pages") as unknown as PagesWithDataTableMessages;
  const d = t.dataTable;
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const columns = useMemo(() => buildColumns(d), [d]);

  const table = useReactTable({
    data: FULL_CUSTOMERS,
    columns,
    state: { sorting, pagination },
    onSortingChange: (updater) =>
      handleSortingChange(updater, setSorting, setPagination),
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const totalRows = table.getPrePaginationRowModel().rows.length;
  const pageCount = table.getPageCount();
  const { pageIndex, pageSize } = pagination;
  const safePageIndex = Math.min(pageIndex, pageCount - 1);
  const from = totalRows === 0 ? 0 : safePageIndex * pageSize + 1;
  const to = Math.min((safePageIndex + 1) * pageSize, totalRows);
  const sizeLabels = [
    d.dataTable7Size5,
    d.dataTable7Size10,
    d.dataTable7Size20,
  ];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-10 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col items-center gap-3 text-center">
          <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
            {d.dataTable7Heading}
          </h2>
          <p className="text-muted text-lg">{d.dataTable7Description}</p>
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
          <div className="flex flex-col items-center justify-between gap-4 border-t p-4 lg:flex-row">
            <div className="flex items-center gap-2">
              <span className="text-muted text-sm">
                {d.dataTable7RowsPerPage}
              </span>
              <PageSizeSelect
                pageSize={pageSize}
                setPagination={setPagination}
                sizeLabels={sizeLabels}
              />
            </div>
            <p className="text-muted text-sm">
              {d.dataTable7ShowingText} {from}–{to} {d.dataTable7OfText}{" "}
              {totalRows}
            </p>
            <div className="flex items-center gap-1.5">
              <PageButton
                page={0}
                pageCount={pageCount}
                setPagination={setPagination}
                leftIcon={<IconChevronsLeft size={16} />}
              >
                {d.dataTable7First}
              </PageButton>
              <PageButton
                page={safePageIndex - 1}
                pageCount={pageCount}
                setPagination={setPagination}
                leftIcon={<IconChevronLeft size={16} />}
              >
                {d.dataTable7Prev}
              </PageButton>
              {Array.from({ length: pageCount }, (_, i) => i).map((page) => (
                <PageButton
                  key={page}
                  page={page}
                  pageCount={pageCount}
                  setPagination={setPagination}
                  variant={page === safePageIndex ? "primary" : "outline"}
                >
                  {page + 1}
                </PageButton>
              ))}
              <PageButton
                page={safePageIndex + 1}
                pageCount={pageCount}
                setPagination={setPagination}
                rightIcon={<IconChevronRight size={16} />}
              >
                {d.dataTable7Next}
              </PageButton>
              <PageButton
                page={pageCount - 1}
                pageCount={pageCount}
                setPagination={setPagination}
                rightIcon={<IconChevronsRight size={16} />}
              >
                {d.dataTable7Last}
              </PageButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
