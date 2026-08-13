"use client";

import { Fragment, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { IconChevronRight } from "@tabler/icons-react";
import { IconButton } from "@/components/ui/Button";
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

type StatusValue = "delivered" | "processing" | "cancelled";

type DataTableMessages = PagesWithDataTableMessages["dataTable"];

interface OrderRef {
  idKey: string;
  customerKey: string;
  dateKey: string;
  status: StatusValue;
}

interface LineItemRef {
  productKey: string;
  qty: number;
  unitPrice: number;
}

interface OrderRow {
  id: string;
  idKey: string;
  customer: string;
  date: string;
  status: StatusValue;
  statusLabel: string;
  total: string;
}

interface LineItem {
  product: string;
  qty: number;
  unitPrice: string;
  amount: string;
}

const STATUS_PILL_CLASSES: Record<StatusValue, string> = {
  delivered: "bg-success/10 text-success",
  processing: "bg-info/10 text-info",
  cancelled: "bg-error/10 text-error",
};

const ORDER_REFS: OrderRef[] = [
  {
    idKey: "dataTable22OrderId1",
    customerKey: "dataTable22Customer1",
    dateKey: "dataTable22Date1",
    status: "delivered",
  },
  {
    idKey: "dataTable22OrderId2",
    customerKey: "dataTable22Customer2",
    dateKey: "dataTable22Date2",
    status: "processing",
  },
  {
    idKey: "dataTable22OrderId3",
    customerKey: "dataTable22Customer3",
    dateKey: "dataTable22Date3",
    status: "delivered",
  },
  {
    idKey: "dataTable22OrderId4",
    customerKey: "dataTable22Customer4",
    dateKey: "dataTable22Date4",
    status: "cancelled",
  },
  {
    idKey: "dataTable22OrderId5",
    customerKey: "dataTable22Customer5",
    dateKey: "dataTable22Date5",
    status: "processing",
  },
];

const LINE_ITEM_REFS: Record<string, LineItemRef[]> = {
  dataTable22OrderId1: [
    { productKey: "dataTable22Product1", qty: 1, unitPrice: 129 },
    { productKey: "dataTable22Product2", qty: 2, unitPrice: 24.5 },
  ],
  dataTable22OrderId2: [
    { productKey: "dataTable22Product3", qty: 1, unitPrice: 259 },
    { productKey: "dataTable22Product4", qty: 3, unitPrice: 12.4 },
    { productKey: "dataTable22Product5", qty: 1, unitPrice: 45 },
  ],
  dataTable22OrderId3: [
    { productKey: "dataTable22Product6", qty: 2, unitPrice: 78 },
  ],
  dataTable22OrderId4: [
    { productKey: "dataTable22Product2", qty: 1, unitPrice: 24.5 },
    { productKey: "dataTable22Product6", qty: 1, unitPrice: 78 },
  ],
  dataTable22OrderId5: [
    { productKey: "dataTable22Product1", qty: 2, unitPrice: 129 },
    { productKey: "dataTable22Product3", qty: 1, unitPrice: 259 },
  ],
};

function getStatusLabel(d: DataTableMessages, status: StatusValue): string {
  switch (status) {
    case "delivered":
      return d.dataTable22StatusDelivered;
    case "processing":
      return d.dataTable22StatusProcessing;
    default:
      return d.dataTable22StatusCancelled;
  }
}

function formatMoney(value: number, currency: string): string {
  return `${currency}${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function orderTotal(itemRefs: LineItemRef[]): number {
  return itemRefs.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
}

function buildOrders(d: DataTableMessages): OrderRow[] {
  return ORDER_REFS.map((order) => ({
    id: d[order.idKey],
    idKey: order.idKey,
    customer: d[order.customerKey],
    date: d[order.dateKey],
    status: order.status,
    statusLabel: getStatusLabel(d, order.status),
    total: formatMoney(
      orderTotal(LINE_ITEM_REFS[order.idKey] ?? []),
      d.dataTable22Currency,
    ),
  }));
}

function buildLineItems(d: DataTableMessages, idKey: string): LineItem[] {
  return (LINE_ITEM_REFS[idKey] ?? []).map((item) => ({
    product: d[item.productKey],
    qty: item.qty,
    unitPrice: formatMoney(item.unitPrice, d.dataTable22Currency),
    amount: formatMoney(item.qty * item.unitPrice, d.dataTable22Currency),
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

function handleToggleExpand(
  id: string,
  setExpandedIds: Dispatch<SetStateAction<Set<string>>>,
) {
  setExpandedIds((prev) => {
    const next = new Set(prev);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    return next;
  });
}

function OrderItemsTable({
  d,
  order,
}: {
  d: DataTableMessages;
  order: OrderRow;
}) {
  const items = buildLineItems(d, order.idKey);

  return (
    <div className="p-4">
      <div className="border-border overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{d.dataTable22ColumnProduct}</TableHead>
              <TableHead className="text-right">
                {d.dataTable22ColumnQty}
              </TableHead>
              <TableHead className="text-right">
                {d.dataTable22ColumnPrice}
              </TableHead>
              <TableHead className="text-right">
                {d.dataTable22ColumnAmount}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.product}>
                <TableCell className="font-medium">{item.product}</TableCell>
                <TableCell className="text-muted text-right tabular-nums">
                  {item.qty}
                </TableCell>
                <TableCell className="text-muted text-right tabular-nums">
                  {item.unitPrice}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {item.amount}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function buildColumns(
  d: DataTableMessages,
  expandedIds: Set<string>,
  setExpandedIds: Dispatch<SetStateAction<Set<string>>>,
): ColumnDef<OrderRow>[] {
  return [
    {
      id: "expand",
      header: () => null,
      enableSorting: false,
      enableHiding: false,
      size: 44,
      cell: ({ row }) => {
        const expanded = expandedIds.has(row.original.id);
        return (
          <IconButton
            icon={
              <IconChevronRight
                size={16}
                className={cn(
                  "transition-transform duration-200",
                  expanded && "rotate-90",
                )}
              />
            }
            label={d.dataTable22ExpandLabel}
            variant="ghost"
            size="icon-xs"
            onClick={() => handleToggleExpand(row.original.id, setExpandedIds)}
          />
        );
      },
    },
    {
      id: "order",
      header: d.dataTable22ColumnOrder,
      cell: ({ row }) => (
        <span className="font-mono text-xs font-medium">{row.original.id}</span>
      ),
    },
    {
      id: "customer",
      header: d.dataTable22ColumnCustomer,
      cell: ({ row }) => (
        <span className="font-medium">{row.original.customer}</span>
      ),
    },
    {
      id: "date",
      header: d.dataTable22ColumnDate,
      cell: ({ row }) => (
        <span className="text-muted whitespace-nowrap">
          {row.original.date}
        </span>
      ),
    },
    {
      id: "status",
      header: d.dataTable22ColumnStatus,
      cell: ({ row }) => (
        <StatusPill
          status={row.original.status}
          label={row.original.statusLabel}
        />
      ),
    },
    {
      id: "total",
      header: d.dataTable22ColumnTotal,
      cell: ({ row }) => (
        <span className="font-medium whitespace-nowrap tabular-nums">
          {row.original.total}
        </span>
      ),
    },
  ];
}

export function NestedSubTableDataTable() {
  const t = useMessages("pages") as unknown as PagesWithDataTableMessages;
  const d = t.dataTable;
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set([d[ORDER_REFS[0].idKey]]),
  );
  const orders = buildOrders(d);
  const columns = buildColumns(d, expandedIds, setExpandedIds);
  const table = useReactTable({
    data: orders,
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
            {d.dataTable22Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.dataTable22Description}
          </Typography>
        </div>
        <div className="bg-surface border-border rounded-xl border shadow-xs">
          <div className="border-border flex items-center justify-between gap-3 border-b p-4">
            <span className="text-muted text-xs font-medium tracking-wider uppercase">
              {d.dataTable22Hint}
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
                <Fragment key={row.id}>
                  <TableRow
                    className="cursor-pointer"
                    onClick={() =>
                      handleToggleExpand(row.original.id, setExpandedIds)
                    }
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
                  {expandedIds.has(row.original.id) && (
                    <TableRow className="hover:bg-surface-hover/60">
                      <TableCell colSpan={columns.length} className="p-0">
                        <OrderItemsTable d={d} order={row.original} />
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
