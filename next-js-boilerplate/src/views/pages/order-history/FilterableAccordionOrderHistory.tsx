"use client";

import { IconFilter, IconPackage } from "@tabler/icons-react";
import { useState } from "react";
import { Accordion, AccordionItemComplex } from "@/components/ui/Accordion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Empty } from "@/components/ui/Empty";
import { NativeSelect } from "@/components/ui/NativeSelect";
import { Separator } from "@/components/ui/Separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/ToggleGroup";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { BadgeVariant } from "@/types/ui/Badge-types";
import type { PagesWithOrderHistoryMessages } from "@/types/pages/order-history/OrderHistoryMessages-types";

type OrderStatus = "processing" | "shipped" | "delivered";
type StatusFilter = "all" | OrderStatus;
type RangeFilter = "all" | "30" | "90" | "365";

type OrderHistoryMessages = PagesWithOrderHistoryMessages["orderHistory"];

interface LineItemRef {
  nameKey: string;
  qty: number;
  price: number;
}

interface OrderRef {
  numberKey: string;
  dateKey: string;
  addressKey: string;
  status: OrderStatus;
  daysAgo: number;
  items: LineItemRef[];
  shippingCost: number;
}

interface LineItem {
  name: string;
  qty: number;
  price: number;
}

interface Order {
  number: string;
  date: string;
  address: string;
  status: OrderStatus;
  statusLabel: string;
  daysAgo: number;
  items: LineItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
}

const STATUS_BADGE_VARIANT: Record<OrderStatus, BadgeVariant> = {
  processing: "warning",
  shipped: "info",
  delivered: "success",
};

const STATUS_LABEL_KEY: Record<OrderStatus, string> = {
  processing: "orderHistory2StatusProcessing",
  shipped: "orderHistory2StatusShipped",
  delivered: "orderHistory2StatusDelivered",
};

const RANGES: { value: RangeFilter; labelKey: string }[] = [
  { value: "all", labelKey: "orderHistory2RangeAll" },
  { value: "30", labelKey: "orderHistory2Range30" },
  { value: "90", labelKey: "orderHistory2Range90" },
  { value: "365", labelKey: "orderHistory2Range365" },
];

const STATUS_FILTERS: { value: StatusFilter; labelKey: string }[] = [
  { value: "all", labelKey: "orderHistory2StatusAll" },
  { value: "processing", labelKey: "orderHistory2StatusProcessing" },
  { value: "shipped", labelKey: "orderHistory2StatusShipped" },
  { value: "delivered", labelKey: "orderHistory2StatusDelivered" },
];

const ORDER_REFS: OrderRef[] = [
  {
    numberKey: "orderHistory2Order1Number",
    dateKey: "orderHistory2Order1Date",
    addressKey: "orderHistory2Order1Address",
    status: "processing",
    daysAgo: 4,
    items: [{ nameKey: "orderHistory2Order1Item1Name", qty: 1, price: 168 }],
    shippingCost: 8,
  },
  {
    numberKey: "orderHistory2Order2Number",
    dateKey: "orderHistory2Order2Date",
    addressKey: "orderHistory2Order2Address",
    status: "shipped",
    daysAgo: 18,
    items: [
      { nameKey: "orderHistory2Order2Item1Name", qty: 2, price: 19 },
      { nameKey: "orderHistory2Order2Item2Name", qty: 1, price: 96 },
    ],
    shippingCost: 0,
  },
  {
    numberKey: "orderHistory2Order3Number",
    dateKey: "orderHistory2Order3Date",
    addressKey: "orderHistory2Order3Address",
    status: "delivered",
    daysAgo: 52,
    items: [{ nameKey: "orderHistory2Order3Item1Name", qty: 1, price: 54 }],
    shippingCost: 6,
  },
  {
    numberKey: "orderHistory2Order4Number",
    dateKey: "orderHistory2Order4Date",
    addressKey: "orderHistory2Order4Address",
    status: "delivered",
    daysAgo: 140,
    items: [
      { nameKey: "orderHistory2Order4Item1Name", qty: 1, price: 240 },
      { nameKey: "orderHistory2Order4Item2Name", qty: 1, price: 38 },
    ],
    shippingCost: 0,
  },
  {
    numberKey: "orderHistory2Order5Number",
    dateKey: "orderHistory2Order5Date",
    addressKey: "orderHistory2Order5Address",
    status: "delivered",
    daysAgo: 310,
    items: [{ nameKey: "orderHistory2Order5Item1Name", qty: 1, price: 44 }],
    shippingCost: 5,
  },
];

function formatMoney(value: number, currency: string): string {
  return `${currency}${value.toFixed(2)}`;
}

function buildOrders(d: OrderHistoryMessages): Order[] {
  return ORDER_REFS.map((ref) => {
    const items = ref.items.map((item) => ({
      name: d[item.nameKey],
      qty: item.qty,
      price: item.price,
    }));
    const subtotal = items.reduce(
      (sum, item) => sum + item.qty * item.price,
      0,
    );
    return {
      number: d[ref.numberKey],
      date: d[ref.dateKey],
      address: d[ref.addressKey],
      status: ref.status,
      statusLabel: d[STATUS_LABEL_KEY[ref.status]],
      daysAgo: ref.daysAgo,
      items,
      subtotal,
      shippingCost: ref.shippingCost,
      total: subtotal + ref.shippingCost,
    };
  });
}

function matchesRange(order: Order, range: RangeFilter): boolean {
  if (range === "all") return true;
  return order.daysAgo <= Number(range);
}

export function FilterableAccordionOrderHistory() {
  const t = useMessages("pages") as unknown as PagesWithOrderHistoryMessages;
  const d = t.orderHistory;
  const orders = buildOrders(d);
  const [range, setRange] = useState<RangeFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  const filtered = orders.filter(
    (order) =>
      matchesRange(order, range) &&
      (status === "all" || order.status === status),
  );

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {d.orderHistory2Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.orderHistory2Description}
          </Typography>
        </div>

        <div className="flex flex-wrap items-end gap-6">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="order-history-2-range"
              className="text-sm font-medium"
            >
              {d.orderHistory2RangeFilterLabel}
            </label>
            <NativeSelect
              id="order-history-2-range"
              value={range}
              onChange={(e) => setRange(e.target.value as RangeFilter)}
              className="min-w-44"
            >
              {RANGES.map((r) => (
                <option key={r.value} value={r.value}>
                  {d[r.labelKey]}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">
              {d.orderHistory2StatusFilterLabel}
            </span>
            <ToggleGroup
              type="single"
              value={status}
              onValueChange={(value) => {
                if (value) setStatus(value as StatusFilter);
              }}
            >
              {STATUS_FILTERS.map((f) => (
                <ToggleGroupItem key={f.value} value={f.value} size="sm">
                  {d[f.labelKey]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="border-border rounded-xl border border-dashed">
            <Empty
              icon={<IconFilter size={28} />}
              title={d.orderHistory2EmptyTitle}
              description={d.orderHistory2EmptyDescription}
            />
          </div>
        ) : (
          <div className="border-border overflow-hidden rounded-xl border">
            <Accordion type="single" collapsible>
              {filtered.map((order) => (
                <AccordionItemComplex
                  key={order.number}
                  value={order.number}
                  leftSlot={
                    <div className="bg-brand/10 text-brand flex size-10 items-center justify-center rounded-full">
                      <IconPackage size={18} aria-hidden="true" />
                    </div>
                  }
                  centerSlot={
                    <div className="flex flex-col gap-0.5">
                      <span className="text-fg font-medium">
                        {order.number}
                      </span>
                      <span className="text-muted text-xs">
                        {order.date} ·{" "}
                        {d.orderHistory2ItemsLabel.replace(
                          "{count}",
                          String(order.items.length),
                        )}
                      </span>
                    </div>
                  }
                  rightSlot={
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={STATUS_BADGE_VARIANT[order.status]}
                        size="sm"
                      >
                        {order.statusLabel}
                      </Badge>
                      <span className="text-fg hidden font-medium tabular-nums sm:inline">
                        {formatMoney(order.total, d.orderHistory2Currency)}
                      </span>
                    </div>
                  }
                  content={
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-2">
                        {order.items.map((item) => (
                          <div
                            key={item.name}
                            className="flex items-center justify-between gap-4 text-sm"
                          >
                            <span className="text-fg">
                              {item.name}{" "}
                              <span className="text-muted">×{item.qty}</span>
                            </span>
                            <span className="text-muted tabular-nums">
                              {formatMoney(
                                item.qty * item.price,
                                d.orderHistory2Currency,
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                      <Separator />
                      <div className="flex flex-col gap-1.5 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted">
                            {d.orderHistory2SubtotalLabel}
                          </span>
                          <span className="tabular-nums">
                            {formatMoney(
                              order.subtotal,
                              d.orderHistory2Currency,
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted">
                            {d.orderHistory2ShippingLabel}
                          </span>
                          <span className="tabular-nums">
                            {order.shippingCost === 0
                              ? d.orderHistory2FreeShipping
                              : formatMoney(
                                  order.shippingCost,
                                  d.orderHistory2Currency,
                                )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between font-semibold">
                          <span>{d.orderHistory2TotalLabel}</span>
                          <span className="tabular-nums">
                            {formatMoney(order.total, d.orderHistory2Currency)}
                          </span>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="text-muted text-xs">
                          {d.orderHistory2ShippingToLabel}: {order.address}
                        </span>
                        <Button type="button" variant="outline" size="sm">
                          {d.orderHistory2ViewInvoice}
                        </Button>
                      </div>
                    </div>
                  }
                />
              ))}
            </Accordion>
          </div>
        )}
      </div>
    </section>
  );
}
