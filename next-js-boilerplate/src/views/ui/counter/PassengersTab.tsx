"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { Counter } from "@/components/ui/Counter";

const MAX_SEATS = 9;

function handleAdultsModuleLevel(
  v: number,
  setAdults: Dispatch<SetStateAction<number>>,
  setInfants: Dispatch<SetStateAction<number>>,
) {
  setAdults(v);
  setInfants((prev) => Math.min(prev, v));
}

export function PassengersTab() {
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);

  const travellers = adults + children + infants;

  const handleAdults = (v: number) =>
    handleAdultsModuleLevel(v, setAdults, setInfants);

  const rows = [
    {
      id: "adults",
      label: "Adults",
      sublabel: "Age 12+",
      value: adults,
      min: 1,
      max: MAX_SEATS - children,
      onChange: handleAdults,
    },
    {
      id: "children",
      label: "Children",
      sublabel: "Age 2–11",
      value: children,
      min: 0,
      max: MAX_SEATS - adults,
      onChange: setChildren,
    },
    {
      id: "infants",
      label: "Infants",
      sublabel: "Under 2, on lap",
      value: infants,
      min: 0,
      max: adults,
      onChange: setInfants,
    },
  ];

  return (
    <div className="flex max-w-sm flex-col gap-3">
      <div className="surface divide-border divide-y overflow-hidden">
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex items-center justify-between gap-4 px-4 py-3"
          >
            <div>
              <p className="text-fg text-sm font-medium">{row.label}</p>
              <p className="text-muted text-xs">{row.sublabel}</p>
            </div>
            <Counter
              label={row.label}
              min={row.min}
              max={row.max}
              value={row.value}
              onChange={row.onChange}
            />
          </div>
        ))}
        <div className="px-4 py-3">
          <p className="text-fg text-sm font-medium">
            {travellers} {travellers === 1 ? "traveller" : "travellers"}
          </p>
          <p className="text-muted text-xs">
            {adults} {adults === 1 ? "adult" : "adults"}, {children}{" "}
            {children === 1 ? "child" : "children"}, {infants}{" "}
            {infants === 1 ? "infant" : "infants"}
          </p>
        </div>
      </div>
      <p className="text-muted text-xs">
        Up to {MAX_SEATS} seated travellers per booking. Infants travel on an
        adult&apos;s lap — one per adult.
      </p>
    </div>
  );
}
