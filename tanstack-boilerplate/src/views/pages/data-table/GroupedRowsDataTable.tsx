"use client";

import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getGroupedRowModel,
  useReactTable,
  type Cell,
  type ColumnDef,
  type Row,
} from "@tanstack/react-table";
import { IconChevronRight } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
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

type CategoryValue = "design" | "engineering" | "marketing";

type DataTableMessages = PagesWithDataTableMessages["dataTable"];

interface GroupedRowRef {
  taskKey: string;
  assigneeKey: string;
  dueKey: string;
  category: CategoryValue;
  estimate: number;
}

interface GroupedRow {
  id: number;
  avatarSeed: string;
  task: string;
  assignee: string;
  category: CategoryValue;
  categoryLabel: string;
  due: string;
  estimate: number;
}

const ROW_REFS: GroupedRowRef[] = [
  {
    taskKey: "dataTable23Row1Task",
    assigneeKey: "dataTable23Row1Assignee",
    dueKey: "dataTable23Row1Due",
    category: "design",
    estimate: 8,
  },
  {
    taskKey: "dataTable23Row2Task",
    assigneeKey: "dataTable23Row2Assignee",
    dueKey: "dataTable23Row2Due",
    category: "design",
    estimate: 12,
  },
  {
    taskKey: "dataTable23Row3Task",
    assigneeKey: "dataTable23Row3Assignee",
    dueKey: "dataTable23Row3Due",
    category: "design",
    estimate: 5,
  },
  {
    taskKey: "dataTable23Row4Task",
    assigneeKey: "dataTable23Row4Assignee",
    dueKey: "dataTable23Row4Due",
    category: "engineering",
    estimate: 16,
  },
  {
    taskKey: "dataTable23Row5Task",
    assigneeKey: "dataTable23Row5Assignee",
    dueKey: "dataTable23Row5Due",
    category: "engineering",
    estimate: 10,
  },
  {
    taskKey: "dataTable23Row6Task",
    assigneeKey: "dataTable23Row6Assignee",
    dueKey: "dataTable23Row6Due",
    category: "engineering",
    estimate: 6,
  },
  {
    taskKey: "dataTable23Row7Task",
    assigneeKey: "dataTable23Row7Assignee",
    dueKey: "dataTable23Row7Due",
    category: "marketing",
    estimate: 4,
  },
  {
    taskKey: "dataTable23Row8Task",
    assigneeKey: "dataTable23Row8Assignee",
    dueKey: "dataTable23Row8Due",
    category: "marketing",
    estimate: 9,
  },
];

function getCategoryLabel(
  d: DataTableMessages,
  category: CategoryValue,
): string {
  switch (category) {
    case "design":
      return d.dataTable23CategoryDesign;
    case "engineering":
      return d.dataTable23CategoryEngineering;
    default:
      return d.dataTable23CategoryMarketing;
  }
}

function buildRows(d: DataTableMessages): GroupedRow[] {
  return ROW_REFS.map((row, index) => ({
    id: index,
    avatarSeed: `dt23-${index + 1}`,
    task: d[row.taskKey],
    assignee: d[row.assigneeKey],
    category: row.category,
    categoryLabel: getCategoryLabel(d, row.category),
    due: d[row.dueKey],
    estimate: row.estimate,
  }));
}

function buildColumns(d: DataTableMessages): ColumnDef<GroupedRow>[] {
  return [
    {
      id: "task",
      header: d.dataTable23ColumnTask,
      aggregationFn: "count",
      aggregatedCell: () => null,
      cell: ({ row }) => (
        <span className="font-medium">{row.original.task}</span>
      ),
    },
    {
      id: "category",
      header: d.dataTable23ColumnCategory,
      accessorKey: "categoryLabel",
      cell: ({ row }) => (
        <span className="text-muted">{row.original.categoryLabel}</span>
      ),
    },
    {
      id: "assignee",
      header: d.dataTable23ColumnAssignee,
      aggregationFn: "count",
      aggregatedCell: () => null,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-2.5">
            <Avatar
              src={placeholderImage(item.avatarSeed, "1x1")}
              alt={item.assignee}
              fallback={item.assignee.charAt(0)}
              size="sm"
            />
            <span className="text-muted">{item.assignee}</span>
          </div>
        );
      },
    },
    {
      id: "due",
      header: d.dataTable23ColumnDue,
      aggregationFn: "count",
      aggregatedCell: () => null,
      cell: ({ row }) => (
        <span className="text-muted whitespace-nowrap">{row.original.due}</span>
      ),
    },
    {
      id: "estimate",
      header: d.dataTable23ColumnEstimate,
      aggregationFn: "sum",
      cell: ({ row }) => (
        <span className="text-muted tabular-nums">
          {row.original.estimate}
          {d.dataTable23HoursSuffix}
        </span>
      ),
      aggregatedCell: ({ getValue }) => (
        <span className="font-semibold tabular-nums">
          {getValue<number>()}
          {d.dataTable23HoursSuffix}
        </span>
      ),
    },
  ];
}

function renderGroupedCell(
  cell: Cell<GroupedRow, unknown>,
  row: Row<GroupedRow>,
) {
  if (cell.getIsPlaceholder()) {
    return <TableCell key={cell.id} />;
  }
  if (cell.getIsGrouped()) {
    return (
      <TableCell key={cell.id}>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={row.getToggleExpandedHandler()}
            aria-expanded={row.getIsExpanded()}
            className="text-fg hover:text-muted inline-flex items-center gap-1.5"
          >
            <IconChevronRight
              size={16}
              className={cn(
                "text-muted transition-transform duration-200",
                row.getIsExpanded() && "rotate-90",
              )}
              aria-hidden="true"
            />
            <span className="font-medium">{cell.getValue<string>()}</span>
          </button>
          <span className="bg-surface text-muted rounded-full px-2 py-0.5 text-xs font-medium tabular-nums">
            {row.subRows.length}
          </span>
        </div>
      </TableCell>
    );
  }
  if (cell.getIsAggregated()) {
    return (
      <TableCell key={cell.id}>
        {flexRender(
          cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell,
          cell.getContext(),
        )}
      </TableCell>
    );
  }
  return (
    <TableCell key={cell.id}>
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </TableCell>
  );
}

export function GroupedRowsDataTable() {
  const t = useMessages("pages") as unknown as PagesWithDataTableMessages;
  const d = t.dataTable;
  const rows = buildRows(d);
  const columns = buildColumns(d);
  const table = useReactTable({
    data: rows,
    columns,
    state: { grouping: ["categoryLabel"] },
    initialState: { expanded: true },
    getCoreRowModel: getCoreRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {d.dataTable23Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.dataTable23Description}
          </Typography>
        </div>
        <div className="bg-surface border-border rounded-xl border shadow-xs">
          <div className="border-border flex items-center justify-between gap-3 border-b p-4">
            <span className="text-muted text-xs font-medium tracking-wider uppercase">
              {d.dataTable23Hint}
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
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row
                    .getVisibleCells()
                    .map((cell) => renderGroupedCell(cell, row))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
