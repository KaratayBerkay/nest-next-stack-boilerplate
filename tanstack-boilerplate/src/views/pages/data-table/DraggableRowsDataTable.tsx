"use client";

import { useState } from "react";
import type { Dispatch, DragEvent, SetStateAction } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { IconGripVertical } from "@tabler/icons-react";
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

type StatusValue = "active" | "invited" | "leave";

type DataTableMessages = PagesWithDataTableMessages["dataTable"];

interface DraggableRowRef {
  nameKey: string;
  emailKey: string;
  roleKey: string;
  status: StatusValue;
  progress: number;
}

interface DraggableRow {
  id: number;
  avatarSeed: string;
  name: string;
  email: string;
  role: string;
  status: StatusValue;
  statusLabel: string;
  progress: number;
}

const STATUS_PILL_CLASSES: Record<StatusValue, string> = {
  active: "bg-success/10 text-success",
  invited: "bg-info/10 text-info",
  leave: "bg-warning/10 text-warning",
};

const ROW_REFS: DraggableRowRef[] = [
  {
    nameKey: "dataTable17Row1Name",
    emailKey: "dataTable17Row1Email",
    roleKey: "dataTable17Row1Role",
    status: "active",
    progress: 86,
  },
  {
    nameKey: "dataTable17Row2Name",
    emailKey: "dataTable17Row2Email",
    roleKey: "dataTable17Row2Role",
    status: "invited",
    progress: 24,
  },
  {
    nameKey: "dataTable17Row3Name",
    emailKey: "dataTable17Row3Email",
    roleKey: "dataTable17Row3Role",
    status: "active",
    progress: 64,
  },
  {
    nameKey: "dataTable17Row4Name",
    emailKey: "dataTable17Row4Email",
    roleKey: "dataTable17Row4Role",
    status: "leave",
    progress: 12,
  },
  {
    nameKey: "dataTable17Row5Name",
    emailKey: "dataTable17Row5Email",
    roleKey: "dataTable17Row5Role",
    status: "active",
    progress: 71,
  },
  {
    nameKey: "dataTable17Row6Name",
    emailKey: "dataTable17Row6Email",
    roleKey: "dataTable17Row6Role",
    status: "active",
    progress: 48,
  },
];

function getStatusLabel(d: DataTableMessages, status: StatusValue): string {
  switch (status) {
    case "active":
      return d.dataTable17StatusActive;
    case "invited":
      return d.dataTable17StatusInvited;
    default:
      return d.dataTable17StatusOnLeave;
  }
}

function buildRows(d: DataTableMessages): DraggableRow[] {
  return ROW_REFS.map((row, index) => ({
    id: index,
    avatarSeed: `dt17-${index + 1}`,
    name: d[row.nameKey],
    email: d[row.emailKey],
    role: d[row.roleKey],
    status: row.status,
    statusLabel: getStatusLabel(d, row.status),
    progress: row.progress,
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

function buildColumns(d: DataTableMessages): ColumnDef<DraggableRow>[] {
  return [
    {
      id: "handle",
      header: () => null,
      enableSorting: false,
      enableHiding: false,
      size: 44,
      cell: () => (
        <span
          className="text-muted flex cursor-grab items-center justify-center active:cursor-grabbing"
          aria-hidden="true"
        >
          <IconGripVertical size={16} />
        </span>
      ),
    },
    {
      id: "member",
      header: d.dataTable17ColumnMember,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar
              src={placeholderImage(item.avatarSeed, "1x1")}
              alt={item.name}
              fallback={item.name.charAt(0)}
              size="sm"
            />
            <div className="flex flex-col">
              <span className="font-medium">{item.name}</span>
              <span className="text-muted text-xs">{item.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      id: "role",
      header: d.dataTable17ColumnRole,
      cell: ({ row }) => (
        <span className="text-muted">{row.original.role}</span>
      ),
    },
    {
      id: "status",
      header: d.dataTable17ColumnStatus,
      cell: ({ row }) => (
        <StatusPill
          status={row.original.status}
          label={row.original.statusLabel}
        />
      ),
    },
    {
      id: "progress",
      header: d.dataTable17ColumnProgress,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="bg-surface-hover h-1.5 w-24 overflow-hidden rounded-full">
            <div
              className="bg-brand h-full rounded-full"
              style={{ width: `${row.original.progress}%` }}
            />
          </div>
          <span className="text-muted w-9 text-xs tabular-nums">
            {row.original.progress}%
          </span>
        </div>
      ),
    },
  ];
}

function handleRowDragStart(
  e: DragEvent,
  index: number,
  setDragIndex: Dispatch<SetStateAction<number | null>>,
) {
  setDragIndex(index);
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", String(index));
}

function handleRowDragOver(
  e: DragEvent,
  index: number,
  setOverIndex: Dispatch<SetStateAction<number | null>>,
) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  setOverIndex(index);
}

function handleRowDragEnd(
  setDragIndex: Dispatch<SetStateAction<number | null>>,
  setOverIndex: Dispatch<SetStateAction<number | null>>,
) {
  setDragIndex(null);
  setOverIndex(null);
}

function handleRowDrop(
  e: DragEvent,
  index: number,
  setRows: Dispatch<SetStateAction<DraggableRow[]>>,
  setDragIndex: Dispatch<SetStateAction<number | null>>,
  setOverIndex: Dispatch<SetStateAction<number | null>>,
) {
  e.preventDefault();
  setDragIndex(null);
  setOverIndex(null);
  const dragIndex = Number(e.dataTransfer.getData("text/plain"));
  if (!Number.isInteger(dragIndex) || dragIndex === index) {
    return;
  }
  setRows((prev) => {
    const next = [...prev];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    return next;
  });
}

export function DraggableRowsDataTable() {
  const t = useMessages("pages") as unknown as PagesWithDataTableMessages;
  const d = t.dataTable;
  const [rows, setRows] = useState<DraggableRow[]>(() => buildRows(d));
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
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
            {d.dataTable17Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.dataTable17Description}
          </Typography>
        </div>
        <div className="bg-surface border-border rounded-xl border shadow-xs">
          <div className="border-border flex items-center justify-between gap-3 border-b p-4">
            <span className="text-muted text-xs font-medium tracking-wider uppercase">
              {d.dataTable17Hint}
            </span>
            <IconGripVertical size={16} className="text-muted" />
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
                <TableRow
                  key={row.id}
                  draggable
                  onDragStart={(e) =>
                    handleRowDragStart(e, row.index, setDragIndex)
                  }
                  onDragOver={(e) =>
                    handleRowDragOver(e, row.index, setOverIndex)
                  }
                  onDrop={(e) =>
                    handleRowDrop(
                      e,
                      row.index,
                      setRows,
                      setDragIndex,
                      setOverIndex,
                    )
                  }
                  onDragEnd={() => handleRowDragEnd(setDragIndex, setOverIndex)}
                  className={cn(
                    "hover:cursor-grab active:cursor-grabbing",
                    row.index === dragIndex && "opacity-50",
                    overIndex === row.index &&
                      dragIndex !== null &&
                      dragIndex !== row.index &&
                      "bg-brand/5 shadow-[inset_0_2px_0_0_var(--brand)]",
                  )}
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
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
