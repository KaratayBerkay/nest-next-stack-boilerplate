"use client";

import { Fragment, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
  type ColumnDef,
  type ExpandedState,
} from "@tanstack/react-table";
import { IconChevronDown } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
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

interface RowRef {
  nameKey: string;
  industryKey: string;
  employeesKey: string;
  descriptionKey: string;
  foundedKey: string;
  revenueKey: string;
  contactKey: string;
  status: StatusValue;
}

const ROW_REFS: RowRef[] = [
  {
    nameKey: "crudCompanies7Row1Name",
    industryKey: "crudCompanies7Row1Industry",
    employeesKey: "crudCompanies7Row1Employees",
    descriptionKey: "crudCompanies7Row1Description",
    foundedKey: "crudCompanies7Row1Founded",
    revenueKey: "crudCompanies7Row1Revenue",
    contactKey: "crudCompanies7Row1Contact",
    status: "active",
  },
  {
    nameKey: "crudCompanies7Row2Name",
    industryKey: "crudCompanies7Row2Industry",
    employeesKey: "crudCompanies7Row2Employees",
    descriptionKey: "crudCompanies7Row2Description",
    foundedKey: "crudCompanies7Row2Founded",
    revenueKey: "crudCompanies7Row2Revenue",
    contactKey: "crudCompanies7Row2Contact",
    status: "prospect",
  },
  {
    nameKey: "crudCompanies7Row3Name",
    industryKey: "crudCompanies7Row3Industry",
    employeesKey: "crudCompanies7Row3Employees",
    descriptionKey: "crudCompanies7Row3Description",
    foundedKey: "crudCompanies7Row3Founded",
    revenueKey: "crudCompanies7Row3Revenue",
    contactKey: "crudCompanies7Row3Contact",
    status: "inactive",
  },
  {
    nameKey: "crudCompanies7Row4Name",
    industryKey: "crudCompanies7Row4Industry",
    employeesKey: "crudCompanies7Row4Employees",
    descriptionKey: "crudCompanies7Row4Description",
    foundedKey: "crudCompanies7Row4Founded",
    revenueKey: "crudCompanies7Row4Revenue",
    contactKey: "crudCompanies7Row4Contact",
    status: "active",
  },
];

interface CompanyRow {
  id: string;
  avatarSeed: string;
  name: string;
  industry: string;
  employees: string;
  description: string;
  founded: string;
  revenue: string;
  contact: string;
  status: StatusValue;
  statusLabel: string;
}

function statusLabel(c: CrudCompaniesMessages, status: StatusValue): string {
  switch (status) {
    case "active":
      return c.crudCompanies7StatusActive;
    case "prospect":
      return c.crudCompanies7StatusProspect;
    default:
      return c.crudCompanies7StatusInactive;
  }
}

function buildRows(c: CrudCompaniesMessages): CompanyRow[] {
  return ROW_REFS.map((ref, index) => ({
    id: String(index + 1),
    avatarSeed: `cc7-${index + 1}`,
    name: c[ref.nameKey],
    industry: c[ref.industryKey],
    employees: c[ref.employeesKey],
    description: c[ref.descriptionKey],
    founded: c[ref.foundedKey],
    revenue: c[ref.revenueKey],
    contact: c[ref.contactKey],
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

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border bg-surface text-muted flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs">
      <dt className="font-medium">{label}</dt>
      <dd className="text-fg font-medium">{value}</dd>
    </div>
  );
}

function ExpandedRowDetail({
  row,
  c,
}: {
  row: CompanyRow;
  c: CrudCompaniesMessages;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <p className="text-muted max-w-2xl text-sm leading-relaxed">
        {row.description}
      </p>
      <dl className="flex flex-wrap gap-2">
        <MetaChip label={c.crudCompanies7MetaFounded} value={row.founded} />
        <MetaChip label={c.crudCompanies7MetaRevenue} value={row.revenue} />
        <MetaChip label={c.crudCompanies7MetaContact} value={row.contact} />
      </dl>
    </div>
  );
}

function buildColumns(c: CrudCompaniesMessages): ColumnDef<CompanyRow>[] {
  return [
    {
      id: "expander",
      header: "",
      cell: ({ row }) => (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="text-muted"
          aria-label={c.crudCompanies7AriaExpand}
          aria-expanded={row.getIsExpanded()}
          onClick={row.getToggleExpandedHandler()}
        >
          <IconChevronDown
            size={16}
            className={cn(
              "transition-transform duration-200",
              row.getIsExpanded() && "rotate-180",
            )}
          />
        </Button>
      ),
    },
    {
      id: "company",
      header: c.crudCompanies7ColCompany,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar
              src={placeholderImage(item.avatarSeed, "1x1")}
              alt=""
              fallback={item.name}
              size="sm"
            />
            <span className="font-medium">{item.name}</span>
          </div>
        );
      },
    },
    {
      id: "industry",
      header: c.crudCompanies7ColIndustry,
      cell: ({ row }) => (
        <span className="text-muted">{row.original.industry}</span>
      ),
    },
    {
      id: "employees",
      header: c.crudCompanies7ColEmployees,
      cell: ({ row }) => (
        <span className="text-muted whitespace-nowrap">
          {row.original.employees}
        </span>
      ),
    },
    {
      id: "status",
      header: c.crudCompanies7ColStatus,
      cell: ({ row }) => (
        <StatusPill
          status={row.original.status}
          label={row.original.statusLabel}
        />
      ),
    },
  ];
}

export function ExpandableDetailRowsCrudCompanies() {
  const t = useMessages("pages") as unknown as PagesWithCrudCompaniesMessages;
  const c = t.crudCompanies;
  const rows = buildRows(c);
  const columns = buildColumns(c);
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const table = useReactTable({
    data: rows,
    columns,
    state: { expanded },
    onExpandedChange: setExpanded,
    getRowCanExpand: () => true,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <h2 className="text-3xl font-medium tracking-tighter md:text-4xl">
            {c.crudCompanies7Heading}
          </h2>
          <p className="text-muted text-base">{c.crudCompanies7Description}</p>
        </div>
        <div className="border-border bg-surface flex flex-col gap-4 rounded-xl border p-4 lg:p-6">
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
                <Fragment key={row.id}>
                  <TableRow
                    data-state={row.getIsExpanded() ? "expanded" : undefined}
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
                  {row.getIsExpanded() && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell
                        colSpan={row.getVisibleCells().length}
                        className="bg-surface/50 p-4"
                      >
                        <ExpandedRowDetail row={row.original} c={c} />
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
