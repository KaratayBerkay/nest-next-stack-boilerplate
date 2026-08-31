"use client";

import {
  IconBolt,
  IconBuildingStore,
  IconBus,
  IconReceipt,
  IconShoppingCart,
} from "@tabler/icons-react";
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
import type { Icon } from "@tabler/icons-react";
import type { PagesWithDataTableMessages } from "@/types/pages/data-table/DataTableMessages-types";

type CategoryValue =
  "groceries" | "transport" | "dining" | "shopping" | "bills";

type DataTableMessages = PagesWithDataTableMessages["dataTable"];

interface TransactionRef {
  descriptionKey: string;
  category: CategoryValue;
  timeKey: string;
  amount: number;
}

interface TransactionRow {
  description: string;
  category: CategoryValue;
  categoryLabel: string;
  time: string;
  amount: number;
}

interface TransactionGroupRef {
  labelKey: string;
  rows: TransactionRef[];
}

interface TransactionGroup {
  label: string;
  total: number;
  rows: TransactionRow[];
}

const CATEGORY_META: Record<
  CategoryValue,
  { icon: Icon; className: string; labelKey: string }
> = {
  groceries: {
    icon: IconShoppingCart,
    className: "bg-success/10 text-success",
    labelKey: "dataTable24CategoryGroceries",
  },
  transport: {
    icon: IconBus,
    className: "bg-info/10 text-info",
    labelKey: "dataTable24CategoryTransport",
  },
  dining: {
    icon: IconReceipt,
    className: "bg-warning/10 text-warning",
    labelKey: "dataTable24CategoryDining",
  },
  shopping: {
    icon: IconBuildingStore,
    className: "bg-brand/10 text-brand",
    labelKey: "dataTable24CategoryShopping",
  },
  bills: {
    icon: IconBolt,
    className: "bg-error/10 text-error",
    labelKey: "dataTable24CategoryBills",
  },
};

const GROUP_REFS: TransactionGroupRef[] = [
  {
    labelKey: "dataTable24GroupToday",
    rows: [
      {
        descriptionKey: "dataTable24Row1Description",
        category: "groceries",
        timeKey: "dataTable24Row1Time",
        amount: -64.2,
      },
      {
        descriptionKey: "dataTable24Row2Description",
        category: "transport",
        timeKey: "dataTable24Row2Time",
        amount: -4.5,
      },
      {
        descriptionKey: "dataTable24Row3Description",
        category: "dining",
        timeKey: "dataTable24Row3Time",
        amount: -32,
      },
    ],
  },
  {
    labelKey: "dataTable24GroupYesterday",
    rows: [
      {
        descriptionKey: "dataTable24Row4Description",
        category: "shopping",
        timeKey: "dataTable24Row4Time",
        amount: -89.9,
      },
      {
        descriptionKey: "dataTable24Row5Description",
        category: "bills",
        timeKey: "dataTable24Row5Time",
        amount: -120,
      },
      {
        descriptionKey: "dataTable24Row6Description",
        category: "dining",
        timeKey: "dataTable24Row6Time",
        amount: -18.4,
      },
    ],
  },
  {
    labelKey: "dataTable24GroupThisWeek",
    rows: [
      {
        descriptionKey: "dataTable24Row7Description",
        category: "groceries",
        timeKey: "dataTable24Row7Time",
        amount: -41.75,
      },
      {
        descriptionKey: "dataTable24Row8Description",
        category: "transport",
        timeKey: "dataTable24Row8Time",
        amount: -12,
      },
    ],
  },
  {
    labelKey: "dataTable24GroupLastMonth",
    rows: [
      {
        descriptionKey: "dataTable24Row9Description",
        category: "bills",
        timeKey: "dataTable24Row9Time",
        amount: -240,
      },
      {
        descriptionKey: "dataTable24Row10Description",
        category: "shopping",
        timeKey: "dataTable24Row10Time",
        amount: -156.5,
      },
    ],
  },
];

function formatMoney(value: number, currency: string): string {
  return `${currency}${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function buildGroups(d: DataTableMessages): TransactionGroup[] {
  return GROUP_REFS.map((group) => ({
    label: d[group.labelKey],
    total: group.rows.reduce((sum, row) => sum + row.amount, 0),
    rows: group.rows.map((row) => ({
      description: d[row.descriptionKey],
      category: row.category,
      categoryLabel: d[CATEGORY_META[row.category].labelKey],
      time: d[row.timeKey],
      amount: row.amount,
    })),
  }));
}

function CategoryChip({
  category,
  label,
}: {
  category: CategoryValue;
  label: string;
}) {
  const meta = CATEGORY_META[category];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        meta.className,
      )}
    >
      <meta.icon size={13} aria-hidden="true" />
      {label}
    </span>
  );
}

export function DateGroupedTransactionsDataTable() {
  const t = useMessages("pages") as unknown as PagesWithDataTableMessages;
  const d = t.dataTable;
  const groups = buildGroups(d);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {d.dataTable24Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.dataTable24Description}
          </Typography>
        </div>
        <div className="bg-surface border-border rounded-xl border shadow-xs">
          <div className="border-border flex items-center justify-between gap-3 border-b p-4">
            <span className="text-muted text-xs font-medium tracking-wider uppercase">
              {d.dataTable24Hint}
            </span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{d.dataTable24ColumnDescription}</TableHead>
                <TableHead>{d.dataTable24ColumnCategory}</TableHead>
                <TableHead className="text-right">
                  {d.dataTable24ColumnTime}
                </TableHead>
                <TableHead className="text-right">
                  {d.dataTable24ColumnAmount}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => (
                <FragmentGroup key={group.label} group={group} d={d} />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}

function FragmentGroup({
  group,
  d,
}: {
  group: TransactionGroup;
  d: DataTableMessages;
}) {
  return (
    <>
      <TableRow className="hover:bg-surface-hover/60">
        <TableCell colSpan={4} className="bg-surface/40 p-2">
          <div className="flex items-center justify-between gap-3 px-2 py-1">
            <span className="text-fg text-sm font-semibold">{group.label}</span>
            <span className="text-muted text-xs tabular-nums">
              {d.dataTable24GroupTotal}{" "}
              {formatMoney(group.total, d.dataTable24Currency)}
            </span>
          </div>
        </TableCell>
      </TableRow>
      {group.rows.map((row) => (
        <TableRow key={row.description}>
          <TableCell className="font-medium">{row.description}</TableCell>
          <TableCell>
            <CategoryChip category={row.category} label={row.categoryLabel} />
          </TableCell>
          <TableCell className="text-muted text-right whitespace-nowrap tabular-nums">
            {row.time}
          </TableCell>
          <TableCell className="text-right font-medium tabular-nums">
            {formatMoney(row.amount, d.dataTable24Currency)}
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
