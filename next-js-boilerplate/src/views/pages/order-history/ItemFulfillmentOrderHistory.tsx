"use client";

import Image from "next/image";
import {
  IconAlertCircle,
  IconCircleCheck,
  IconClock,
  IconTruck,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { Icon } from "@tabler/icons-react";
import type { BadgeVariant } from "@/types/ui/Badge-types";
import type { PagesWithOrderHistoryMessages } from "@/types/pages/order-history/OrderHistoryMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

type ItemStatus = "processing" | "shipped" | "delivered" | "backordered";

type OrderHistoryMessages = PagesWithOrderHistoryMessages["orderHistory"];

interface LineItemRef {
  nameKey: string;
  qty: number;
  status: ItemStatus;
  seed: string;
}

interface OrderRef {
  numberKey: string;
  dateKey: string;
  items: LineItemRef[];
}

interface LineItem {
  name: string;
  qty: number;
  status: ItemStatus;
  statusLabel: string;
  seed: string;
}

interface Order {
  id: string;
  number: string;
  date: string;
  items: LineItem[];
}

const STATUS_META: Record<
  ItemStatus,
  { icon: Icon; variant: BadgeVariant; labelKey: string }
> = {
  processing: {
    icon: IconClock,
    variant: "warning",
    labelKey: "orderHistory3StatusProcessing",
  },
  shipped: {
    icon: IconTruck,
    variant: "info",
    labelKey: "orderHistory3StatusShipped",
  },
  delivered: {
    icon: IconCircleCheck,
    variant: "success",
    labelKey: "orderHistory3StatusDelivered",
  },
  backordered: {
    icon: IconAlertCircle,
    variant: "error",
    labelKey: "orderHistory3StatusBackordered",
  },
};

const ORDER_REFS: OrderRef[] = [
  {
    numberKey: "orderHistory3Order1Number",
    dateKey: "orderHistory3Order1Date",
    items: [
      {
        nameKey: "orderHistory3Order1Item1Name",
        qty: 1,
        status: "delivered",
        seed: "oh3-1-1",
      },
      {
        nameKey: "orderHistory3Order1Item2Name",
        qty: 2,
        status: "shipped",
        seed: "oh3-1-2",
      },
      {
        nameKey: "orderHistory3Order1Item3Name",
        qty: 1,
        status: "processing",
        seed: "oh3-1-3",
      },
    ],
  },
  {
    numberKey: "orderHistory3Order2Number",
    dateKey: "orderHistory3Order2Date",
    items: [
      {
        nameKey: "orderHistory3Order2Item1Name",
        qty: 1,
        status: "delivered",
        seed: "oh3-2-1",
      },
      {
        nameKey: "orderHistory3Order2Item2Name",
        qty: 1,
        status: "backordered",
        seed: "oh3-2-2",
      },
    ],
  },
  {
    numberKey: "orderHistory3Order3Number",
    dateKey: "orderHistory3Order3Date",
    items: [
      {
        nameKey: "orderHistory3Order3Item1Name",
        qty: 1,
        status: "delivered",
        seed: "oh3-3-1",
      },
      {
        nameKey: "orderHistory3Order3Item2Name",
        qty: 2,
        status: "delivered",
        seed: "oh3-3-2",
      },
      {
        nameKey: "orderHistory3Order3Item3Name",
        qty: 1,
        status: "delivered",
        seed: "oh3-3-3",
      },
    ],
  },
];

function buildOrders(d: OrderHistoryMessages): Order[] {
  return ORDER_REFS.map((ref) => ({
    id: ref.numberKey,
    number: d[ref.numberKey],
    date: d[ref.dateKey],
    items: ref.items.map((item) => ({
      name: d[item.nameKey],
      qty: item.qty,
      status: item.status,
      statusLabel: d[STATUS_META[item.status].labelKey],
      seed: item.seed,
    })),
  }));
}

function ItemRow({
  item,
  qtyLabel,
  imageAlt,
}: {
  item: LineItem;
  qtyLabel: string;
  imageAlt: string;
}) {
  const meta = STATUS_META[item.status];
  return (
    <div className="flex items-center gap-4 p-4 lg:px-6">
      <div className="bg-surface relative size-12 shrink-0 overflow-hidden rounded-lg">
        <Image
          src={placeholderImage(item.seed, "1x1")}
          alt={imageAlt}
          fill
          sizes="48px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-fg truncate text-sm font-medium">{item.name}</p>
        <p className="text-muted text-xs">
          {qtyLabel.replace("{count}", String(item.qty))}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <meta.icon
          size={14}
          className="text-muted hidden sm:block"
          aria-hidden="true"
        />
        <Badge variant={meta.variant} size="sm">
          {item.statusLabel}
        </Badge>
      </div>
    </div>
  );
}

export function ItemFulfillmentOrderHistory() {
  const t = useMessages("pages") as unknown as PagesWithOrderHistoryMessages;
  const d = t.orderHistory;
  const orders = buildOrders(d);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {d.orderHistory3Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.orderHistory3Description}
          </Typography>
        </div>

        <div className="flex flex-col gap-6">
          {orders.map((order) => {
            const deliveredCount = order.items.filter(
              (item) => item.status === "delivered",
            ).length;
            const pct = Math.round((deliveredCount / order.items.length) * 100);
            return (
              <Card key={order.id} className="overflow-hidden">
                <div className="border-border flex flex-wrap items-center justify-between gap-4 border-b p-4 lg:px-6 lg:py-5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted text-xs font-medium tracking-wider uppercase">
                      {d.orderHistory3OrderLabel}
                    </span>
                    <span className="text-fg font-semibold">
                      {order.number}
                    </span>
                    <span className="text-muted text-xs">{order.date}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-muted text-xs whitespace-nowrap">
                      {d.orderHistory3FulfillmentLabel
                        .replace("{delivered}", String(deliveredCount))
                        .replace("{total}", String(order.items.length))}
                    </span>
                    <div className="w-32 sm:w-44">
                      <Progress value={pct} size="sm" />
                    </div>
                  </div>
                </div>
                <div className="divide-border flex flex-col divide-y">
                  {order.items.map((item) => (
                    <ItemRow
                      key={item.name}
                      item={item}
                      qtyLabel={d.orderHistory3QtyLabel}
                      imageAlt={d.orderHistory3ItemImageAlt}
                    />
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
