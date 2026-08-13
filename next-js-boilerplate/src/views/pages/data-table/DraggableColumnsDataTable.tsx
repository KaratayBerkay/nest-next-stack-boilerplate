"use client";

import { useState } from "react";
import type { Dispatch, DragEvent, SetStateAction } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type HeaderContext,
  type Table,
} from "@tanstack/react-table";
import { IconGripVertical } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
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

interface DraggableColumnRowRef {
  nameKey: string;
  emailKey: string;
  roleKey: string;
  lastActiveKey: string;
  status: StatusValue;
}

interface DraggableColumnRow {
  id: number;
  avatarSeed: string;
  name: string;
  email: string;
  role: string;
  lastActive: string;
  status: StatusValue;
  statusLabel: string;
}

interface DragHeaderProps {
  label: string;
  context: HeaderContext<DraggableColumnRow, unknown>;
  dragId: string | null;
  overId: string | null;
  setDragId: Dispatch<SetStateAction<string | null>>;
  setOverId: Dispatch<SetStateAction<string | null>>;
}

const STATUS_PILL_CLASSES: Record<StatusValue, string> = {
  active: "bg-success/10 text-success",
  invited: "bg-info/10 text-info",
  suspended: "bg-warning/10 text-warning",
};

const ROW_REFS: DraggableColumnRowRef[] = [
  {
    nameKey: "dataTable18Row1Name",
    emailKey: "dataTable18Row1Email",
    roleKey: "dataTable18Row1Role",
    lastActiveKey: "dataTable18Row1LastActive",
    status: "active",
  },
  {
    nameKey: "dataTable18Row2Name",
    emailKey: "dataTable18Row2Email",
    roleKey: "dataTable18Row2Role",
    lastActiveKey: "dataTable18Row2LastActive",
    status: "invited",
  },
  {
    nameKey: "dataTable18Row3Name",
    emailKey: "dataTable18Row3Email",
    roleKey: "dataTable18Row3Role",
    lastActiveKey: "dataTable18Row3LastActive",
    status: "active",
  },
  {
    nameKey: "dataTable18Row4Name",
    emailKey: "dataTable18Row4Email",
    roleKey: "dataTable18Row4Role",
    lastActiveKey: "dataTable18Row4LastActive",
    status: "suspended",
  },
  {
    nameKey: "dataTable18Row5Name",
    emailKey: "dataTable18Row5Email",
    roleKey: "dataTable18Row5Role",
    lastActiveKey: "dataTable18Row5LastActive",
    status: "active",
  },
  {
    nameKey: "dataTable18Row6Name",
    emailKey: "dataTable18Row6Email",
    roleKey: "dataTable18Row6Role",
    lastActiveKey: "dataTable18Row6LastActive",
    status: "active",
  },
];

function getStatusLabel(d: DataTableMessages, status: StatusValue): string {
  switch (status) {
    case "active":
      return d.dataTable18StatusActive;
    case "invited":
      return d.dataTable18StatusInvited;
    default:
      return d.dataTable18StatusSuspended;
  }
}

function buildRows(d: DataTableMessages): DraggableColumnRow[] {
  return ROW_REFS.map((row, index) => ({
    id: index,
    avatarSeed: `dt18-${index + 1}`,
    name: d[row.nameKey],
    email: d[row.emailKey],
    role: d[row.roleKey],
    lastActive: d[row.lastActiveKey],
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

function reorderColumnIds(
  ids: string[],
  fromId: string,
  toId: string,
): string[] {
  const from = ids.indexOf(fromId);
  const to = ids.indexOf(toId);
  if (from === -1 || to === -1 || from === to) {
    return ids;
  }
  const next = [...ids];
  next.splice(from, 1);
  next.splice(to, 0, fromId);
  return next;
}

function handleColumnDragStart(
  e: DragEvent,
  columnId: string,
  setDragId: Dispatch<SetStateAction<string | null>>,
) {
  setDragId(columnId);
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", columnId);
}

function handleColumnDragOver(
  e: DragEvent,
  columnId: string,
  setOverId: Dispatch<SetStateAction<string | null>>,
) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  setOverId(columnId);
}

function handleColumnDragEnd(
  setDragId: Dispatch<SetStateAction<string | null>>,
  setOverId: Dispatch<SetStateAction<string | null>>,
) {
  setDragId(null);
  setOverId(null);
}

function handleColumnDrop(
  e: DragEvent,
  columnId: string,
  table: Table<DraggableColumnRow>,
  dragId: string | null,
  setDragId: Dispatch<SetStateAction<string | null>>,
  setOverId: Dispatch<SetStateAction<string | null>>,
) {
  e.preventDefault();
  setOverId(null);
  const sourceId = dragId ?? e.dataTransfer.getData("text/plain");
  if (!sourceId || sourceId === columnId) {
    setDragId(null);
    return;
  }
  const ids = table.getAllLeafColumns().map((column) => column.id);
  table.setColumnOrder(reorderColumnIds(ids, sourceId, columnId));
  setDragId(null);
}

function DragHeader({
  label,
  context,
  dragId,
  overId,
  setDragId,
  setOverId,
}: DragHeaderProps) {
  const { column, table } = context;
  const isOver =
    overId === column.id && dragId !== null && dragId !== column.id;
  return (
    <div
      draggable
      onDragStart={(e) => handleColumnDragStart(e, column.id, setDragId)}
      onDragOver={(e) => handleColumnDragOver(e, column.id, setOverId)}
      onDrop={(e) =>
        handleColumnDrop(e, column.id, table, dragId, setDragId, setOverId)
      }
      onDragEnd={() => handleColumnDragEnd(setDragId, setOverId)}
      className={cn("flex items-center gap-2 select-none", isOver && "text-fg")}
    >
      <span>{label}</span>
      <IconGripVertical
        size={14}
        className={cn("text-muted", dragId === column.id && "text-brand")}
      />
    </div>
  );
}

function buildColumns(
  d: DataTableMessages,
  dragState: Omit<DragHeaderProps, "label" | "context">,
): ColumnDef<DraggableColumnRow>[] {
  const headerLabel = (label: string) => {
    function HeaderLabel(context: HeaderContext<DraggableColumnRow, unknown>) {
      return <DragHeader label={label} context={context} {...dragState} />;
    }
    HeaderLabel.displayName = "HeaderLabel";
    return HeaderLabel;
  };

  return [
    {
      id: "member",
      header: headerLabel(d.dataTable18ColumnMember),
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
      header: headerLabel(d.dataTable18ColumnEmail),
      cell: ({ row }) => (
        <span className="text-muted">{row.original.email}</span>
      ),
    },
    {
      id: "status",
      header: headerLabel(d.dataTable18ColumnStatus),
      cell: ({ row }) => (
        <StatusPill
          status={row.original.status}
          label={row.original.statusLabel}
        />
      ),
    },
    {
      id: "lastActive",
      header: headerLabel(d.dataTable18ColumnLastActive),
      cell: ({ row }) => (
        <span className="text-muted whitespace-nowrap">
          {row.original.lastActive}
        </span>
      ),
    },
  ];
}

export function DraggableColumnsDataTable() {
  const t = useMessages("pages") as unknown as PagesWithDataTableMessages;
  const d = t.dataTable;
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const rows = buildRows(d);
  const columns = buildColumns(d, { dragId, overId, setDragId, setOverId });
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
            {d.dataTable18Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.dataTable18Description}
          </Typography>
        </div>
        <div className="bg-surface border-border rounded-xl border shadow-xs">
          <div className="border-border flex items-center justify-between gap-3 border-b p-4">
            <span className="text-muted text-xs font-medium tracking-wider uppercase">
              {d.dataTable18Hint}
            </span>
            <IconGripVertical size={16} className="text-muted" />
          </div>
          <TablePrimitive>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="h-12">
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
