"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type Table,
} from "@tanstack/react-table";
import { IconArrowDown, IconArrowUp, IconColumns3 } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button, IconButton } from "@/components/ui/Button";
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

type StatusValue = "active" | "invited" | "suspended";

type DataTableMessages = PagesWithDataTableMessages["dataTable"];

interface ColumnManageRowRef {
  nameKey: string;
  emailKey: string;
  roleKey: string;
  status: StatusValue;
}

interface ColumnManageRow {
  id: number;
  avatarSeed: string;
  name: string;
  email: string;
  role: string;
  status: StatusValue;
  statusLabel: string;
}

const STATUS_PILL_CLASSES: Record<StatusValue, string> = {
  active: "bg-success/10 text-success",
  invited: "bg-info/10 text-info",
  suspended: "bg-warning/10 text-warning",
};

const ROW_REFS: ColumnManageRowRef[] = [
  {
    nameKey: "dataTable21Row1Name",
    emailKey: "dataTable21Row1Email",
    roleKey: "dataTable21Row1Role",
    status: "active",
  },
  {
    nameKey: "dataTable21Row2Name",
    emailKey: "dataTable21Row2Email",
    roleKey: "dataTable21Row2Role",
    status: "active",
  },
  {
    nameKey: "dataTable21Row3Name",
    emailKey: "dataTable21Row3Email",
    roleKey: "dataTable21Row3Role",
    status: "invited",
  },
  {
    nameKey: "dataTable21Row4Name",
    emailKey: "dataTable21Row4Email",
    roleKey: "dataTable21Row4Role",
    status: "suspended",
  },
  {
    nameKey: "dataTable21Row5Name",
    emailKey: "dataTable21Row5Email",
    roleKey: "dataTable21Row5Role",
    status: "active",
  },
  {
    nameKey: "dataTable21Row6Name",
    emailKey: "dataTable21Row6Email",
    roleKey: "dataTable21Row6Role",
    status: "invited",
  },
];

function getStatusLabel(d: DataTableMessages, status: StatusValue): string {
  switch (status) {
    case "active":
      return d.dataTable21StatusActive;
    case "invited":
      return d.dataTable21StatusInvited;
    default:
      return d.dataTable21StatusSuspended;
  }
}

function buildRows(d: DataTableMessages): ColumnManageRow[] {
  return ROW_REFS.map((row, index) => ({
    id: index,
    avatarSeed: `dt21-${index + 1}`,
    name: d[row.nameKey],
    email: d[row.emailKey],
    role: d[row.roleKey],
    status: row.status,
    statusLabel: getStatusLabel(d, row.status),
  }));
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

function columnLabel(d: DataTableMessages, columnId: string): string {
  switch (columnId) {
    case "name":
      return d.dataTable21ColumnName;
    case "email":
      return d.dataTable21ColumnEmail;
    case "role":
      return d.dataTable21ColumnRole;
    default:
      return d.dataTable21ColumnStatus;
  }
}

function handleMoveColumn(
  table: Table<ColumnManageRow>,
  columnId: string,
  direction: -1 | 1,
) {
  const ids = table.getAllLeafColumns().map((column) => column.id);
  const from = ids.indexOf(columnId);
  const to = from + direction;
  if (from === -1 || to < 0 || to >= ids.length) {
    return;
  }
  const next = [...ids];
  next.splice(from, 1);
  next.splice(to, 0, columnId);
  table.setColumnOrder(next);
}

function handleShowAll(table: Table<ColumnManageRow>) {
  table.getAllLeafColumns().forEach((column) => column.toggleVisibility(true));
}

function buildColumns(d: DataTableMessages): ColumnDef<ColumnManageRow>[] {
  return [
    {
      id: "name",
      header: d.dataTable21ColumnName,
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
              <span className="text-muted text-xs">{item.role}</span>
            </div>
          </div>
        );
      },
    },
    {
      id: "email",
      header: d.dataTable21ColumnEmail,
      cell: ({ row }) => (
        <span className="text-muted">{row.original.email}</span>
      ),
    },
    {
      id: "status",
      header: d.dataTable21ColumnStatus,
      cell: ({ row }) => (
        <StatusPill
          status={row.original.status}
          label={row.original.statusLabel}
        />
      ),
    },
  ];
}

function ColumnVisibilityMenu({
  d,
  table,
}: {
  d: DataTableMessages;
  table: Table<ColumnManageRow>;
}) {
  const leafColumns = table.getAllLeafColumns();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<IconColumns3 size={16} />}
        >
          {d.dataTable21ColumnsLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64">
        <DropdownMenuLabel>{d.dataTable21MenuLabel}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {leafColumns.map((column) => {
          const index = leafColumns.indexOf(column);
          return (
            <div key={column.id} className={cn(menuItemStyles, "gap-1")}>
              <Checkbox
                checked={column.getIsVisible()}
                onChange={column.getToggleVisibilityHandler()}
                label={columnLabel(d, column.id)}
                size="sm"
                className="cursor-pointer"
              />
              <div className="ml-auto flex items-center">
                <IconButton
                  icon={<IconArrowUp size={14} />}
                  label={d.dataTable21MoveUp}
                  variant="ghost"
                  size="icon-xs"
                  disabled={index === 0}
                  onClick={() => handleMoveColumn(table, column.id, -1)}
                />
                <IconButton
                  icon={<IconArrowDown size={14} />}
                  label={d.dataTable21MoveDown}
                  variant="ghost"
                  size="icon-xs"
                  disabled={index === leafColumns.length - 1}
                  onClick={() => handleMoveColumn(table, column.id, 1)}
                />
              </div>
            </div>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="gap-2"
          onClick={() => handleShowAll(table)}
        >
          {d.dataTable21ShowAll}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-2"
          onClick={() => table.resetColumnVisibility()}
        >
          {d.dataTable21Reset}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ColumnManagementDataTable() {
  const t = useMessages("pages") as unknown as PagesWithDataTableMessages;
  const d = t.dataTable;
  const rows = buildRows(d);
  const columns = buildColumns(d);
  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {d.dataTable21Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.dataTable21Description}
          </Typography>
        </div>
        <div className="bg-surface border-border rounded-xl border shadow-xs">
          <div className="border-border flex flex-wrap items-center justify-between gap-3 border-b p-4">
            <span className="text-muted text-xs font-medium tracking-wider uppercase">
              {d.dataTable21Hint}
            </span>
            <ColumnVisibilityMenu d={d} table={table} />
          </div>
          <TablePrimitive>
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
          </TablePrimitive>
        </div>
      </div>
    </section>
  );
}
