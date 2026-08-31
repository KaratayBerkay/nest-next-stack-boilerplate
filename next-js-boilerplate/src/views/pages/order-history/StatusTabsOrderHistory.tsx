"use client";

import {
  IconCircleCheck,
  IconCircleX,
  IconClock,
  IconTruck,
} from "@tabler/icons-react";
import { useState } from "react";
import { Avatar, AvatarGroup } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
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
import type { PagesWithOrderHistoryMessages } from "@/types/pages/order-history/OrderHistoryMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

type OrderStatus = "processing" | "shipped" | "delivered" | "cancelled";
type TabValue = "all" | OrderStatus;

type OrderHistoryMessages = PagesWithOrderHistoryMessages["orderHistory"];

interface OrderRef {
  numberKey: string;
  dateKey: string;
  status: OrderStatus;
  itemCount: number;
  seed: string;
  total: number;
}

interface Order {
  number: string;
  date: string;
  status: OrderStatus;
  statusLabel: string;
  itemCount: number;
  seed: string;
  total: string;
}

const STATUS_META: Record<
  OrderStatus,
  { icon: Icon; className: string; labelKey: string }
> = {
  processing: {
    icon: IconClock,
    className: "bg-warning/10 text-warning",
    labelKey: "orderHistory1StatusProcessing",
  },
  shipped: {
    icon: IconTruck,
    className: "bg-info/10 text-info",
    labelKey: "orderHistory1StatusShipped",
  },
  delivered: {
    icon: IconCircleCheck,
    className: "bg-success/10 text-success",
    labelKey: "orderHistory1StatusDelivered",
  },
  cancelled: {
    icon: IconCircleX,
    className: "bg-error/10 text-error",
    labelKey: "orderHistory1StatusCancelled",
  },
};

const TABS: { value: TabValue; labelKey: string }[] = [
  { value: "all", labelKey: "orderHistory1TabAll" },
  { value: "processing", labelKey: "orderHistory1TabProcessing" },
  { value: "shipped", labelKey: "orderHistory1TabShipped" },
  { value: "delivered", labelKey: "orderHistory1TabDelivered" },
  { value: "cancelled", labelKey: "orderHistory1TabCancelled" },
];

const ORDER_REFS: OrderRef[] = [
  {
    numberKey: "orderHistory1Row1Number",
    dateKey: "orderHistory1Row1Date",
    status: "processing",
    itemCount: 2,
    seed: "oh1-order-1",
    total: 128,
  },
  {
    numberKey: "orderHistory1Row2Number",
    dateKey: "orderHistory1Row2Date",
    status: "shipped",
    itemCount: 1,
    seed: "oh1-order-2",
    total: 64,
  },
  {
    numberKey: "orderHistory1Row3Number",
    dateKey: "orderHistory1Row3Date",
    status: "delivered",
    itemCount: 3,
    seed: "oh1-order-3",
    total: 214.5,
  },
  {
    numberKey: "orderHistory1Row4Number",
    dateKey: "orderHistory1Row4Date",
    status: "delivered",
    itemCount: 1,
    seed: "oh1-order-4",
    total: 42,
  },
  {
    numberKey: "orderHistory1Row5Number",
    dateKey: "orderHistory1Row5Date",
    status: "cancelled",
    itemCount: 2,
    seed: "oh1-order-5",
    total: 96,
  },
  {
    numberKey: "orderHistory1Row6Number",
    dateKey: "orderHistory1Row6Date",
    status: "delivered",
    itemCount: 4,
    seed: "oh1-order-6",
    total: 356.2,
  },
];

function formatMoney(value: number, currency: string): string {
  return `${currency}${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function buildOrders(d: OrderHistoryMessages): Order[] {
  return ORDER_REFS.map((ref) => ({
    number: d[ref.numberKey],
    date: d[ref.dateKey],
    status: ref.status,
    statusLabel: d[STATUS_META[ref.status].labelKey],
    itemCount: ref.itemCount,
    seed: ref.seed,
    total: formatMoney(ref.total, d.orderHistory1Currency),
  }));
}

function StatusPill({ status, label }: { status: OrderStatus; label: string }) {
  const meta = STATUS_META[status];
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

export function StatusTabsOrderHistory() {
  const t = useMessages("pages") as unknown as PagesWithOrderHistoryMessages;
  const d = t.orderHistory;
  const orders = buildOrders(d);
  const [activeTab, setActiveTab] = useState<TabValue>("all");

  const filtered =
    activeTab === "all" ? orders : orders.filter((o) => o.status === activeTab);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {d.orderHistory1Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.orderHistory1Description}
          </Typography>
        </div>
        <div className="border-border bg-surface flex flex-col gap-4 rounded-xl border p-4 lg:p-6">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as TabValue)}
          >
            <TabsList>
              {TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {d[tab.labelKey]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{d.orderHistory1ColumnOrder}</TableHead>
                <TableHead>{d.orderHistory1ColumnItems}</TableHead>
                <TableHead className="text-right">
                  {d.orderHistory1ColumnTotal}
                </TableHead>
                <TableHead>{d.orderHistory1ColumnStatus}</TableHead>
                <TableHead className="text-right">
                  {d.orderHistory1ColumnAction}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((order) => (
                <TableRow key={order.number}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-fg font-medium">
                        {order.number}
                      </span>
                      <span className="text-muted text-xs">{order.date}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <AvatarGroup max={3} size="xs">
                        {Array.from({ length: order.itemCount }).map((_, i) => (
                          <Avatar
                            key={i}
                            src={placeholderImage(`${order.seed}-${i}`, "1x1")}
                            alt={d.orderHistory1ItemImageAlt}
                            fallback={String(i + 1)}
                            size="xs"
                          />
                        ))}
                      </AvatarGroup>
                      <span className="text-muted text-xs whitespace-nowrap">
                        {d.orderHistory1ItemsLabel.replace(
                          "{count}",
                          String(order.itemCount),
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {order.total}
                  </TableCell>
                  <TableCell>
                    <StatusPill
                      status={order.status}
                      label={order.statusLabel}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button type="button" variant="ghost" size="xs">
                      {d.orderHistory1ViewAction}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
