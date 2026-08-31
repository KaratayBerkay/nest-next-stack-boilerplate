"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  IconChevronLeft,
  IconChevronRight,
  IconColumns3,
} from "@tabler/icons-react";
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
import { menuItemStyles } from "@/components/ui/menu-item-styles";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  CrudCompaniesMessages,
  PagesWithCrudCompaniesMessages,
} from "@/types/pages/crud-companies/CrudCompaniesMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

type StatusValue = "active" | "prospect" | "inactive";

const STATUS_CLASSES: Record<StatusValue, string> = {
  active: "bg-success/10 text-success",
  prospect: "bg-info/10 text-info",
  inactive: "bg-muted/15 text-muted",
};

const PAGE_SIZE = 3 as const;

interface RowRef {
  nameKey: string;
  industryKey: string;
  websiteKey: string;
  employees: number;
  founded: number;
  status: StatusValue;
}

const ROW_REFS: RowRef[] = [
  {
    nameKey: "crudCompanies9Row1Name",
    industryKey: "crudCompanies9Row1Industry",
    websiteKey: "crudCompanies9Row1Website",
    employees: 61,
    founded: 2016,
    status: "active",
  },
  {
    nameKey: "crudCompanies9Row2Name",
    industryKey: "crudCompanies9Row2Industry",
    websiteKey: "crudCompanies9Row2Website",
    employees: 224,
    founded: 2011,
    status: "prospect",
  },
  {
    nameKey: "crudCompanies9Row3Name",
    industryKey: "crudCompanies9Row3Industry",
    websiteKey: "crudCompanies9Row3Website",
    employees: 18,
    founded: 2022,
    status: "active",
  },
  {
    nameKey: "crudCompanies9Row4Name",
    industryKey: "crudCompanies9Row4Industry",
    websiteKey: "crudCompanies9Row4Website",
    employees: 97,
    founded: 2015,
    status: "inactive",
  },
  {
    nameKey: "crudCompanies9Row5Name",
    industryKey: "crudCompanies9Row5Industry",
    websiteKey: "crudCompanies9Row5Website",
    employees: 410,
    founded: 2005,
    status: "active",
  },
  {
    nameKey: "crudCompanies9Row6Name",
    industryKey: "crudCompanies9Row6Industry",
    websiteKey: "crudCompanies9Row6Website",
    employees: 33,
    founded: 2020,
    status: "prospect",
  },
];

interface CompanyRow {
  id: string;
  avatarSeed: string;
  name: string;
  industry: string;
  website: string;
  employees: number;
  founded: number;
  status: StatusValue;
  statusLabel: string;
}

function statusLabel(c: CrudCompaniesMessages, status: StatusValue): string {
  switch (status) {
    case "active":
      return c.crudCompanies9StatusActive;
    case "prospect":
      return c.crudCompanies9StatusProspect;
    default:
      return c.crudCompanies9StatusInactive;
  }
}

function buildRows(c: CrudCompaniesMessages): CompanyRow[] {
  return ROW_REFS.map((ref, index) => ({
    id: String(index + 1),
    avatarSeed: `cc9-${index + 1}`,
    name: c[ref.nameKey],
    industry: c[ref.industryKey],
    website: c[ref.websiteKey],
    employees: ref.employees,
    founded: ref.founded,
    status: ref.status,
    statusLabel: statusLabel(c, ref.status),
  }));
}

function StatusPill({ status, label }: { status: StatusValue; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        STATUS_CLASSES[status],
      )}
    >
      {label}
    </span>
  );
}

function buildColumns(c: CrudCompaniesMessages): ColumnDef<CompanyRow>[] {
  return [
    {
      id: "name",
      header: c.crudCompanies9ColName,
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={placeholderImage(row.original.avatarSeed, "1x1")}
            alt=""
            fallback={row.original.name}
            size="sm"
          />
          <span className="font-medium whitespace-nowrap">
            {row.original.name}
          </span>
        </div>
      ),
    },
    {
      id: "industry",
      header: c.crudCompanies9ColIndustry,
      cell: ({ row }) => (
        <span className="text-muted">{row.original.industry}</span>
      ),
    },
    {
      id: "employees",
      header: c.crudCompanies9ColEmployees,
      cell: ({ row }) => (
        <span className="tabular-nums">
          {row.original.employees.toLocaleString()}
        </span>
      ),
    },
    {
      id: "founded",
      header: c.crudCompanies9ColFounded,
      cell: ({ row }) => (
        <span className="text-muted tabular-nums">{row.original.founded}</span>
      ),
    },
    {
      id: "website",
      header: c.crudCompanies9ColWebsite,
      cell: ({ row }) => (
        <span className="text-brand whitespace-nowrap">
          {row.original.website}
        </span>
      ),
    },
    {
      id: "status",
      header: c.crudCompanies9ColStatus,
      cell: ({ row }) => (
        <StatusPill
          status={row.original.status}
          label={row.original.statusLabel}
        />
      ),
    },
  ];
}

function ColumnsMenu({
  c,
  leafColumns,
}: {
  c: CrudCompaniesMessages;
  leafColumns: ReturnType<
    ReturnType<typeof useReactTable<CompanyRow>>["getAllLeafColumns"]
  >;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" leftIcon={<IconColumns3 size={15} />}>
          {c.crudCompanies9ColumnsMenuLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>{c.crudCompanies9ColumnsMenuHeading}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {leafColumns
          .filter((column) => column.getCanHide())
          .map((column) => (
            <div key={column.id} className={cn(menuItemStyles, "gap-2")}>
              <Checkbox
                checked={column.getIsVisible()}
                onChange={column.getToggleVisibilityHandler()}
                label={String(column.columnDef.header)}
                size="sm"
                className="cursor-pointer"
              />
            </div>
          ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() =>
            leafColumns.forEach((column) => column.toggleVisibility(true))
          }
        >
          {c.crudCompanies9ShowAllLabel}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ColumnVisibilityTableCrudCompanies() {
  const t = useMessages("pages") as unknown as PagesWithCrudCompaniesMessages;
  const c = t.crudCompanies;
  const rows = useMemo(() => buildRows(c), [c]);
  const columns = useMemo(() => buildColumns(c), [c]);

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pageIndex, setPageIndex] = useState(0);

  const table = useReactTable({
    data: rows,
    columns,
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
  });

  const allTableRows = table.getRowModel().rows;
  const totalPages = Math.max(1, Math.ceil(allTableRows.length / PAGE_SIZE));
  const safePageIndex = Math.min(pageIndex, totalPages - 1);
  const pageRows = allTableRows.slice(
    safePageIndex * PAGE_SIZE,
    safePageIndex * PAGE_SIZE + PAGE_SIZE,
  );

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <h2 className="text-3xl font-medium tracking-tighter md:text-4xl">
            {c.crudCompanies9Heading}
          </h2>
          <p className="text-muted text-base">{c.crudCompanies9Description}</p>
        </div>
        <div className="bg-surface border-border rounded-xl border shadow-xs">
          <div className="border-border flex flex-wrap items-center justify-end gap-3 border-b p-4">
            <ColumnsMenu c={c} leafColumns={table.getAllLeafColumns()} />
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
          <div className="flex items-center justify-between gap-4 border-t p-4">
            <span className="text-muted text-xs">
              {c.crudCompanies9PageLabel
                .replace("{page}", String(safePageIndex + 1))
                .replace("{total}", String(totalPages))}
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<IconChevronLeft size={15} />}
                disabled={safePageIndex <= 0}
                onClick={() => setPageIndex((prev) => Math.max(0, prev - 1))}
              >
                {c.crudCompanies9PrevLabel}
              </Button>
              <Button
                variant="outline"
                size="sm"
                rightIcon={<IconChevronRight size={15} />}
                disabled={safePageIndex >= totalPages - 1}
                onClick={() =>
                  setPageIndex((prev) => Math.min(totalPages - 1, prev + 1))
                }
              >
                {c.crudCompanies9NextLabel}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
