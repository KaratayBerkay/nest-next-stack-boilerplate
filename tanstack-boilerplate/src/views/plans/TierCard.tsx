"use client";

import Link from "next/link";
import { tierLabel } from "@/lib/tier";
import type { TierCardProps } from "@/types/plans/TierCard-types";

export function TierCard({
  tier,
  price,
  features,
  current,
  ctaLabel,
  ctaHref,
  currentLabel,
  changePending,
}: TierCardProps) {
  return (
    <div
      className={`flex flex-col rounded-xl border p-6 ${
        current ? "border-brand ring-brand/20 ring-2" : "border-border"
      }`}
    >
      <h3 className="text-lg font-semibold">{tierLabel(tier)}</h3>
      <p className="text-muted mt-1 text-2xl font-bold">{price}</p>
      <ul className="mt-4 flex flex-col gap-2">
        {features.map((f) => (
          <li key={f} className="text-muted text-sm">
            {f}
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-6">
        {current ? (
          <span className="bg-surface text-muted block rounded-lg px-4 py-2 text-center text-sm font-medium">
            {currentLabel}
          </span>
        ) : ctaHref && !changePending ? (
          <Link
            href={ctaHref}
            className="bg-brand hover:bg-brand/90 text-brand-fg block rounded-lg px-4 py-2 text-center text-sm font-medium"
          >
            {ctaLabel}
          </Link>
        ) : (
          <span className="bg-surface text-muted block rounded-lg px-4 py-2 text-center text-sm font-medium">
            {ctaLabel}
          </span>
        )}
      </div>
    </div>
  );
}
