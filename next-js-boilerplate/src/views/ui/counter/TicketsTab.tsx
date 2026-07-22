"use client";

import { useState } from "react";
import { Counter } from "@/components/ui/Counter";
import { Button } from "@/components/ui/Button";

const usd = (n: number) => `$${n.toFixed(2)}`;

export function TicketsTab() {
  const [general, setGeneral] = useState(0);
  const [vip, setVip] = useState(0);
  const [raffle, setRaffle] = useState(0);

  const total = general * 25 + vip * 75 + raffle * 2;

  const rows = [
    {
      id: "general",
      name: "General Admission",
      note: "$25 each · max 8 per order",
      value: general,
      max: 8,
      step: 1,
      onChange: setGeneral,
      lineTotal: general * 25,
    },
    {
      id: "vip",
      name: "VIP",
      note: "$75 each · only 3 left",
      value: vip,
      max: 3,
      step: 1,
      onChange: setVip,
      lineTotal: vip * 75,
    },
    {
      id: "raffle",
      name: "Raffle Tickets",
      note: "$2 each · sold in packs of 5",
      value: raffle,
      max: 25,
      step: 5,
      onChange: setRaffle,
      lineTotal: raffle * 2,
    },
  ];

  return (
    <div className="surface divide-border max-w-md divide-y overflow-hidden">
      {rows.map((row) => (
        <div key={row.id} className="flex items-center gap-4 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-fg text-sm font-medium">{row.name}</p>
            <p className="text-muted text-xs">{row.note}</p>
          </div>
          <Counter
            label={row.name}
            min={0}
            max={row.max}
            step={row.step}
            value={row.value}
            onChange={row.onChange}
          />
          <span className="text-fg w-14 text-right text-sm tabular-nums">
            {row.lineTotal === 0 ? "—" : usd(row.lineTotal)}
          </span>
        </div>
      ))}
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-fg text-base font-semibold tabular-nums">
          {usd(total)}
        </span>
        <Button variant="primary" disabled={total === 0}>
          Checkout
        </Button>
      </div>
    </div>
  );
}
