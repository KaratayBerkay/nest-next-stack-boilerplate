"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type Header,
  type SortingState,
} from "@tanstack/react-table";
import {
  IconArrowDown,
  IconArrowsSort,
  IconArrowUp,
  IconFilter,
  IconInbox,
  IconSearch,
  IconX,
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
import { Input } from "@/components/ui/Input";
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

const STATUSES: StatusValue[] = ["active", "prospect", "inactive"];

interface RowRef {
  nameKey: string;
  industryKey: string;
  locationKey: string;
  employees: number;
  founded: number;
  status: StatusValue;
}

const ROW_REFS: RowRef[] = [
  {
    nameKey: "crudCompanies8Row1Name",
    industryKey: "crudCompanies8Row1Industry",
    locationKey: "crudCompanies8Row1Location",
    employees: 84,
    founded: 2014,
    status: "active",
  },
  {
    nameKey: "crudCompanies8Row2Name",
    industryKey: "crudCompanies8Row2Industry",
    locationKey: "crudCompanies8Row2Location",
    employees: 312,
    founded: 2009,
    status: "active",
  },
  {
    nameKey: "crudCompanies8Row3Name",
    industryKey: "crudCompanies8Row3Industry",
    locationKey: "crudCompanies8Row3Location",
    employees: 27,
    founded: 2021,
    status: "prospect",
  },
  {
    nameKey: "crudCompanies8Row4Name",
    industryKey: "crudCompanies8Row4Industry",
    locationKey: "crudCompanies8Row4Location",
    employees: 156,
    founded: 2017,
    status: "inactive",
  },
  {
    nameKey: "crudCompanies8Row5Name",
    industryKey: "crudCompanies8Row5Industry",
    locationKey: "crudCompanies8Row5Location",
    employees: 48,
    founded: 2019,
    status: "prospect",
  },
  {
    nameKey: "crudCompanies8Row6Name",
    industryKey: "crudCompanies8Row6Industry",
    locationKey: "crudCompanies8Row6Location",
    employees: 943,
    founded: 2001,
    status: "active",
  },
];

interface CompanyRow {
  id: string;
  avatarSeed: string;
  name: string;
  industry: string;
  location: string;
  employees: number;
  founded: number;
  status: StatusValue;
  statusLabel: string;
}

function statusLabel(c: CrudCompaniesMessages, status: StatusValue): string {
  switch (status) {
    case "active":
      return c.crudCompanies8StatusActive;
    case "prospect":
      return c.crudCompanies8StatusProspect;
    default:
      return c.crudCompanies8StatusInactive;
  }
}

function buildRows(c: CrudCompaniesMessages): CompanyRow[] {
  return ROW_REFS.map((ref, index) => ({
    id: String(index + 1),
    avatarSeed: `cc8-${index + 1}`,
    name: c[ref.nameKey],
    industry: c[ref.industryKey],
    location: c[ref.locationKey],
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

function SortHeader({
  header,
  label,
}: {
  header: Header<CompanyRow, unknown>;
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
        <IconArrowUp size={13} className="shrink-0" />
      ) : sorted === "desc" ? (
        <IconArrowDown size={13} className="shrink-0" />
      ) : (
        <IconArrowsSort size={13} className="text-muted shrink-0" />
      )}
    </button>
  );
}

function buildColumns(c: CrudCompaniesMessages): ColumnDef<CompanyRow>[] {
  return [
    {
      accessorKey: "name",
      header: ({ header }) => (
        <SortHeader header={header} label={c.crudCompanies8ColCompany} />
      ),
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
      accessorKey: "industry",
      header: ({ header }) => (
        <SortHeader header={header} label={c.crudCompanies8ColIndustry} />
      ),
      cell: ({ row }) => (
        <span className="text-muted">{row.original.industry}</span>
      ),
    },
    {
      accessorKey: "location",
      header: ({ header }) => (
        <SortHeader header={header} label={c.crudCompanies8ColLocation} />
      ),
      cell: ({ row }) => (
        <span className="text-muted whitespace-nowrap">
          {row.original.location}
        </span>
      ),
    },
    {
      accessorKey: "employees",
      header: ({ header }) => (
        <SortHeader header={header} label={c.crudCompanies8ColEmployees} />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums">
          {row.original.employees.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "founded",
      header: ({ header }) => (
        <SortHeader header={header} label={c.crudCompanies8ColFounded} />
      ),
      cell: ({ row }) => (
        <span className="text-muted tabular-nums">{row.original.founded}</span>
      ),
    },
    {
      id: "status",
      header: c.crudCompanies8ColStatus,
      cell: ({ row }) => (
        <StatusPill
          status={row.original.status}
          label={row.original.statusLabel}
        />
      ),
    },
  ];
}

export function AdvancedFilterSortTableCrudCompanies() {
  const t = useMessages("pages") as unknown as PagesWithCrudCompaniesMessages;
  const c = t.crudCompanies;
  const allRows = useMemo(() => buildRows(c), [c]);
  const columns = useMemo(() => buildColumns(c), [c]);

  const [query, setQuery] = useState("");
  const [statuses, setStatuses] = useState<StatusValue[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allRows.filter((row) => {
      const matchesQuery =
        !q ||
        row.name.toLowerCase().includes(q) ||
        row.industry.toLowerCase().includes(q) ||
        row.location.toLowerCase().includes(q);
      const matchesStatus =
        statuses.length === 0 || statuses.includes(row.status);
      return matchesQuery && matchesStatus;
    });
  }, [allRows, query, statuses]);

  const table = useReactTable({
    data: filteredRows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  function toggleStatus(status: StatusValue) {
    setStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((item) => item !== status)
        : [...prev, status],
    );
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <h2 className="text-3xl font-medium tracking-tighter md:text-4xl">
            {c.crudCompanies8Heading}
          </h2>
          <p className="text-muted text-base">{c.crudCompanies8Description}</p>
        </div>
        <div className="border-border bg-surface flex flex-col gap-4 rounded-xl border p-4 lg:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-full max-w-xs">
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={c.crudCompanies8SearchPlaceholder}
                leftIcon={<IconSearch size={15} />}
                aria-label={c.crudCompanies8SearchPlaceholder}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<IconFilter size={15} />}
                >
                  {c.crudCompanies8StatusFilterLabel}
                  {statuses.length > 0 && (
                    <span className="text-muted">({statuses.length})</span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>
                  {c.crudCompanies8StatusFilterLabel}
                </DropdownMenuLabel>
                {STATUSES.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={(event) => event.preventDefault()}
                  >
                    <Checkbox
                      checked={statuses.includes(status)}
                      onChange={() => toggleStatus(status)}
                      label={statusLabel(c, status)}
                    />
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setStatuses([])}>
                  <IconX size={14} aria-hidden="true" />
                  {c.crudCompanies8ClearFiltersLabel}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="text-muted ml-auto text-xs">
              {c.crudCompanies8RowCountLabel.replace(
                "{n}",
                String(filteredRows.length),
              )}
            </span>
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
                        size={22}
                        className="text-muted"
                        aria-hidden="true"
                      />
                      <span className="text-muted text-sm">
                        {c.crudCompanies8NoResultsLabel}
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
