"use client";

import { useEffect, useState } from "react";
import {
  IconShoppingBag,
  IconShoppingCart,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";
import { Progress } from "@/components/ui/Progress";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithLivePurchaseMessages } from "@/types/pages/live-purchase/LivePurchaseMessages-types";

const TICK_MS = 3000;
const BASE_ORDERS = 182;
const BASE_REVENUE = 9840;
const AVG_ORDER_VALUE = 96;
const BASE_SHOPPERS = 41;
const SHOPPER_WIGGLE = [0, 3, -2, 4, -1, 2, -3] as const;
const STOCK_START = 38;
const STOCK_STEP = 2;
const STOCK_FLOOR = 6;

interface FeedEvent {
  id: string;
  headlineKey: string;
  timeKey: string;
}

const EVENTS: FeedEvent[] = [
  {
    id: "stats-feed-1",
    headlineKey: "livePurchase3Event1Headline",
    timeKey: "livePurchase3Event1Time",
  },
  {
    id: "stats-feed-2",
    headlineKey: "livePurchase3Event2Headline",
    timeKey: "livePurchase3Event2Time",
  },
  {
    id: "stats-feed-3",
    headlineKey: "livePurchase3Event3Headline",
    timeKey: "livePurchase3Event3Time",
  },
  {
    id: "stats-feed-4",
    headlineKey: "livePurchase3Event4Headline",
    timeKey: "livePurchase3Event4Time",
  },
  {
    id: "stats-feed-5",
    headlineKey: "livePurchase3Event5Headline",
    timeKey: "livePurchase3Event5Time",
  },
];

export function StatsAlertLivePurchase() {
  const t = useMessages("pages") as unknown as PagesWithLivePurchaseMessages;
  const lp = t.livePurchase;
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setTick((prev) => prev + 1);
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  const feed = [0, 4, 3].map(
    (offset) => EVENTS[(tick + offset) % EVENTS.length],
  );
  const ordersToday = BASE_ORDERS + tick;
  const revenueToday = BASE_REVENUE + tick * AVG_ORDER_VALUE;
  const shoppersOnline =
    BASE_SHOPPERS + SHOPPER_WIGGLE[tick % SHOPPER_WIGGLE.length];
  const stockPercent = Math.max(STOCK_START - tick * STOCK_STEP, STOCK_FLOOR);

  return (
    <section className="border-border bg-surface w-full rounded-3xl border p-6 lg:p-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="flex flex-col gap-4 lg:col-span-3">
          <h3 className="text-muted text-xs font-semibold tracking-wide uppercase">
            {lp.livePurchase3FeedHeading}
          </h3>
          <ul className="flex flex-col gap-2" aria-live="polite">
            {feed.map((item) => (
              <li
                key={item.id}
                className="animate-fade-in border-border bg-bg flex items-center gap-3 rounded-xl border p-3 motion-reduce:animate-none"
              >
                <span className="bg-brand/10 text-brand flex size-9 shrink-0 items-center justify-center rounded-full">
                  <IconShoppingBag size={16} />
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="text-fg truncate text-sm font-medium">
                    {lp[item.headlineKey]}
                  </p>
                  <p className="text-muted text-xs">{lp[item.timeKey]}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="border-border flex flex-col gap-5 border-t pt-6 lg:col-span-2 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
          <h3 className="text-muted text-xs font-semibold tracking-wide uppercase">
            {lp.livePurchase3StatsHeading}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-muted flex items-center gap-1 text-xs">
                <IconShoppingCart size={12} />
                {lp.livePurchase3StatOrdersLabel}
              </span>
              <span className="text-fg text-2xl font-semibold tabular-nums">
                {ordersToday}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted flex items-center gap-1 text-xs">
                <IconTrendingUp size={12} />
                {lp.livePurchase3StatRevenueLabel}
              </span>
              <span className="text-fg text-2xl font-semibold tabular-nums">
                {lp.livePurchase3CurrencySymbol}
                {revenueToday.toLocaleString("en-US")}
              </span>
            </div>
            <div className="col-span-2 flex flex-col gap-1">
              <span className="text-muted flex items-center gap-1 text-xs">
                <IconUsers size={12} />
                {lp.livePurchase3StatViewersLabel}
              </span>
              <span className="text-fg text-2xl font-semibold tabular-nums">
                {shoppersOnline}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted text-xs">
                {lp.livePurchase3StockLabel}
              </span>
              <span className="text-fg truncate text-xs font-medium">
                {lp.livePurchase3StockProductName}
              </span>
            </div>
            <Progress
              value={stockPercent}
              size="sm"
              showValueLabel
              aria-label={lp.livePurchase3StockLabel}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
