"use client";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type HeaderContext,
  type SortingState,
  type Table,
} from "@tanstack/react-table";
import { useState } from "react";
import {
  IconArrowDown,
  IconArrowUp,
  IconChevronDown,
  IconEyeOff,
  IconPin,
} from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { IconButton } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {
  Table as TablePrimitive,
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

type StageValue = "qualified" | "proposal" | "negotiation" | "closed";

type DataTableMessages = PagesWithDataTableMessages["dataTable"];

interface ColumnMenuRowRef {
  nameKey: string;
  companyKey: string;
  ownerKey: string;
  stage: StageValue;
  value: number;
}

interface ColumnMenuRow {
  id: number;
  avatarSeed: string;
  name: string;
  company: string;
  owner: string;
  stage: StageValue;
  stageLabel: string;
  value: string;
}

const DEFAULT_COLUMN_ORDER = ["name", "company", "stage", "owner", "value"];

const STAGE_PILL_CLASSES: Record<StageValue, string> = {
  qualified: "bg-success/10 text-success",
  proposal: "bg-info/10 text-info",
  negotiation: "bg-warning/10 text-warning",
  closed: "bg-brand/10 text-brand",
};

const ROW_REFS: ColumnMenuRowRef[] = [
  {
    nameKey: "dataTable19Row1Name",
    companyKey: "dataTable19Row1Company",
    ownerKey: "dataTable19Row1Owner",
    stage: "qualified",
    value: 12400,
  },
  {
    nameKey: "dataTable19Row2Name",
    companyKey: "dataTable19Row2Company",
    ownerKey: "dataTable19Row2Owner",
    stage: "proposal",
    value: 8600,
  },
  {
    nameKey: "dataTable19Row3Name",
    companyKey: "dataTable19Row3Company",
    ownerKey: "dataTable19Row3Owner",
    stage: "negotiation",
    value: 21500,
  },
  {
    nameKey: "dataTable19Row4Name",
    companyKey: "dataTable19Row4Company",
    ownerKey: "dataTable19Row4Owner",
    stage: "closed",
    value: 43200,
  },
  {
    nameKey: "dataTable19Row5Name",
    companyKey: "dataTable19Row5Company",
    ownerKey: "dataTable19Row5Owner",
    stage: "qualified",
    value: 6800,
  },
  {
    nameKey: "dataTable19Row6Name",
    companyKey: "dataTable19Row6Company",
    ownerKey: "dataTable19Row6Owner",
    stage: "proposal",
    value: 15900,
  },
];

function getStageLabel(d: DataTableMessages, stage: StageValue): string {
  switch (stage) {
    case "qualified":
      return d.dataTable19StageQualified;
    case "proposal":
      return d.dataTable19StageProposal;
    case "negotiation":
      return d.dataTable19StageNegotiation;
    default:
      return d.dataTable19StageClosed;
  }
}

function formatMoney(value: number, currency: string): string {
  return `${currency}${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function buildRows(d: DataTableMessages): ColumnMenuRow[] {
  return ROW_REFS.map((row, index) => ({
    id: index,
    avatarSeed: `dt19-${index + 1}`,
    name: d[row.nameKey],
    company: d[row.companyKey],
    owner: d[row.ownerKey],
    stage: row.stage,
    stageLabel: getStageLabel(d, row.stage),
    value: formatMoney(row.value, d.dataTable19Currency),
  }));
}

function StagePill({ stage, label }: { stage: StageValue; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        STAGE_PILL_CLASSES[stage],
      )}
    >
      {label}
    </span>
  );
}

function handlePinColumn(
  column: Column<ColumnMenuRow, unknown>,
  table: Table<ColumnMenuRow>,
  side: "left" | "right",
) {
  if (column.getIsPinned() === side) {
    return;
  }
  column.pin(side);
  const current = table.getAllLeafColumns().map((c) => c.id);
  const from = current.indexOf(column.id);
  if (from === -1) {
    return;
  }
  const next = [...current];
  next.splice(from, 1);
  if (side === "left") {
    next.unshift(column.id);
  } else {
    next.push(column.id);
  }
  table.setColumnOrder(next);
}

function handleUnpinColumn(
  column: Column<ColumnMenuRow, unknown>,
  table: Table<ColumnMenuRow>,
) {
  column.pin(false);
  table.setColumnOrder(DEFAULT_COLUMN_ORDER);
}

function HeaderWithMenu({
  label,
  context,
  d,
}: {
  label: string;
  context: HeaderContext<ColumnMenuRow, unknown>;
  d: DataTableMessages;
}) {
  const { column, table } = context;
  const pinned = column.getIsPinned();
  return (
    <div className="flex items-center gap-1.5">
      {pinned && (
        <IconPin
          size={12}
          className={cn(
            pinned === "left" ? "text-brand" : "text-brand rotate-90",
          )}
          aria-hidden="true"
        />
      )}
      <span>{label}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton
            icon={<IconChevronDown size={14} />}
            label={d.dataTable19MenuLabel}
            variant="ghost"
            size="icon-xs"
            className="text-muted hover:text-fg"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            className="gap-2"
            onClick={() => column.toggleSorting(false, true)}
          >
            <IconArrowUp size={14} aria-hidden="true" />
            {d.dataTable19SortAsc}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-2"
            onClick={() => column.toggleSorting(true, true)}
          >
            <IconArrowDown size={14} aria-hidden="true" />
            {d.dataTable19SortDesc}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-2"
            onClick={() => column.toggleVisibility(false)}
          >
            <IconEyeOff size={14} aria-hidden="true" />
            {d.dataTable19Hide}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-2"
            disabled={pinned === "left"}
            onClick={() => handlePinColumn(column, table, "left")}
          >
            <IconPin size={14} aria-hidden="true" />
            {d.dataTable19PinLeft}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-2"
            disabled={pinned === "right"}
            onClick={() => handlePinColumn(column, table, "right")}
          >
            <IconPin size={14} className="rotate-90" aria-hidden="true" />
            {d.dataTable19PinRight}
          </DropdownMenuItem>
          {pinned && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2"
                onClick={() => handleUnpinColumn(column, table)}
              >
                <IconPin size={14} className="text-muted" aria-hidden="true" />
                {d.dataTable19Unpin}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function buildColumns(d: DataTableMessages): ColumnDef<ColumnMenuRow>[] {
  const headerWithMenu = (label: string) => {
    function HeaderWithLabel(context: HeaderContext<ColumnMenuRow, unknown>) {
      return <HeaderWithMenu label={label} context={context} d={d} />;
    }
    HeaderWithLabel.displayName = "HeaderWithLabel";
    return HeaderWithLabel;
  };

  return [
    {
      id: "name",
      header: headerWithMenu(d.dataTable19ColumnName),
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar
              src={`https://picsum.photos/seed/${item.avatarSeed}/64/64`}
              alt={item.name}
              fallback={item.name.charAt(0)}
              size="sm"
            />
            <div className="flex flex-col">
              <span className="font-medium">{item.name}</span>
              <span className="text-muted text-xs">{item.company}</span>
            </div>
          </div>
        );
      },
    },
    {
      id: "stage",
      header: headerWithMenu(d.dataTable19ColumnStage),
      cell: ({ row }) => (
        <StagePill stage={row.original.stage} label={row.original.stageLabel} />
      ),
    },
    {
      id: "owner",
      header: headerWithMenu(d.dataTable19ColumnOwner),
      cell: ({ row }) => (
        <span className="text-muted">{row.original.owner}</span>
      ),
    },
    {
      id: "value",
      header: headerWithMenu(d.dataTable19ColumnValue),
      cell: ({ row }) => (
        <span className="font-medium whitespace-nowrap tabular-nums">
          {row.original.value}
        </span>
      ),
    },
  ];
}

export function ColumnMenuDataTable() {
  const t = useMessages("pages") as unknown as PagesWithDataTableMessages;
  const d = t.dataTable;
  const [sorting, setSorting] = useState<SortingState>([]);
  const rows = buildRows(d);
  const columns = buildColumns(d);
  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {d.dataTable19Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.dataTable19Description}
          </Typography>
        </div>
        <div className="bg-surface border-border rounded-xl border shadow-xs">
          <div className="border-border border-b p-4">
            <span className="text-muted text-xs font-medium tracking-wider uppercase">
              {d.dataTable19Hint}
            </span>
          </div>
          <TablePrimitive>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        header.column.getIsPinned() === "left" &&
                          "shadow-[inset_3px_0_0_0_hsl(var(--brand))]",
                        header.column.getIsPinned() === "right" &&
                          "shadow-[inset_-3px_0_0_0_hsl(var(--brand))]",
                      )}
                    >
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
          </TablePrimitive>
        </div>
      </div>
    </section>
  );
}
