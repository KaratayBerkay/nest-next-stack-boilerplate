"use client";

import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnSizingInfoState,
  type ColumnSizingState,
} from "@tanstack/react-table";
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

type CategoryValue = "electronics" | "office" | "accessories";

type DataTableMessages = PagesWithDataTableMessages["dataTable"];

interface ResizableRowRef {
  productKey: string;
  skuKey: string;
  category: CategoryValue;
  stock: number;
  price: number;
}

interface ResizableRow {
  id: number;
  product: string;
  sku: string;
  category: CategoryValue;
  categoryLabel: string;
  stock: number;
  price: string;
}

const ROW_REFS: ResizableRowRef[] = [
  {
    productKey: "dataTable20Row1Product",
    skuKey: "dataTable20Row1Sku",
    category: "electronics",
    stock: 42,
    price: 129,
  },
  {
    productKey: "dataTable20Row2Product",
    skuKey: "dataTable20Row2Sku",
    category: "office",
    stock: 8,
    price: 34.5,
  },
  {
    productKey: "dataTable20Row3Product",
    skuKey: "dataTable20Row3Sku",
    category: "accessories",
    stock: 120,
    price: 19.9,
  },
  {
    productKey: "dataTable20Row4Product",
    skuKey: "dataTable20Row4Sku",
    category: "electronics",
    stock: 3,
    price: 259,
  },
  {
    productKey: "dataTable20Row5Product",
    skuKey: "dataTable20Row5Sku",
    category: "office",
    stock: 64,
    price: 12.4,
  },
  {
    productKey: "dataTable20Row6Product",
    skuKey: "dataTable20Row6Sku",
    category: "accessories",
    stock: 27,
    price: 45,
  },
];

function getCategoryLabel(
  d: DataTableMessages,
  category: CategoryValue,
): string {
  switch (category) {
    case "electronics":
      return d.dataTable20CategoryElectronics;
    case "office":
      return d.dataTable20CategoryOffice;
    default:
      return d.dataTable20CategoryAccessories;
  }
}

function formatMoney(value: number, currency: string): string {
  return `${currency}${value.toFixed(2)}`;
}

function buildRows(d: DataTableMessages): ResizableRow[] {
  return ROW_REFS.map((row, index) => ({
    id: index,
    product: d[row.productKey],
    sku: d[row.skuKey],
    category: row.category,
    categoryLabel: getCategoryLabel(d, row.category),
    stock: row.stock,
    price: formatMoney(row.price, d.dataTable20Currency),
  }));
}

function buildColumns(d: DataTableMessages): ColumnDef<ResizableRow>[] {
  return [
    {
      id: "product",
      header: d.dataTable20ColumnProduct,
      size: 260,
      cell: ({ row }) => (
        <span className="font-medium">{row.original.product}</span>
      ),
    },
    {
      id: "sku",
      header: d.dataTable20ColumnSku,
      size: 150,
      cell: ({ row }) => (
        <span className="text-muted font-mono text-xs">{row.original.sku}</span>
      ),
    },
    {
      id: "category",
      header: d.dataTable20ColumnCategory,
      size: 170,
      cell: ({ row }) => (
        <span className="text-muted">{row.original.categoryLabel}</span>
      ),
    },
    {
      id: "stock",
      header: d.dataTable20ColumnStock,
      size: 120,
      cell: ({ row }) => (
        <span
          className={cn(
            "font-medium tabular-nums",
            row.original.stock < 10 ? "text-warning" : "text-fg",
          )}
        >
          {row.original.stock}
        </span>
      ),
    },
    {
      id: "price",
      header: d.dataTable20ColumnPrice,
      size: 140,
      cell: ({ row }) => (
        <span className="font-medium whitespace-nowrap tabular-nums">
          {row.original.price}
        </span>
      ),
    },
  ];
}

export function ResizableColumnsDataTable() {
  const t = useMessages("pages") as unknown as PagesWithDataTableMessages;
  const d = t.dataTable;
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
  const [columnSizingInfo, setColumnSizingInfo] =
    useState<ColumnSizingInfoState>({} as ColumnSizingInfoState);
  const rows = buildRows(d);
  const columns = buildColumns(d);
  const table = useReactTable({
    data: rows,
    columns,
    state: { columnSizing, columnSizingInfo },
    onColumnSizingChange: setColumnSizing,
    onColumnSizingInfoChange: setColumnSizingInfo,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
  });
  const isResizingColumn = columnSizingInfo.isResizingColumn;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {d.dataTable20Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.dataTable20Description}
          </Typography>
        </div>
        <div className="bg-surface border-border rounded-xl border shadow-xs">
          <div className="border-border flex items-center justify-between gap-3 border-b p-4">
            <span className="text-muted text-xs font-medium tracking-wider uppercase">
              {d.dataTable20Hint}
            </span>
          </div>
          <Table
            style={{
              width: table.getTotalSize(),
              minWidth: "100%",
            }}
          >
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      style={{
                        position: "relative",
                        width: header.getSize(),
                      }}
                      className="select-none"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                      {header.column.getCanResize() && (
                        <div
                          onDoubleClick={() => header.column.resetSize()}
                          onPointerDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={cn(
                            "absolute top-0 right-0 z-10 h-full w-1 cursor-col-resize touch-none",
                            isResizingColumn === header.column.id
                              ? "bg-brand"
                              : "bg-border hover:bg-brand/50",
                          )}
                          aria-hidden="true"
                        />
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
                    <TableCell
                      key={cell.id}
                      style={{ width: cell.column.getSize() }}
                    >
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
