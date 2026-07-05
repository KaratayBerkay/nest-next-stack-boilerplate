"use client";

import { useAuth } from "@/hooks/useAuth";
import { TIERS, tierLabel, tierAtLeast, type Tier } from "@/lib/tier";
import { checkoutPath } from "@/constants/routes";
import Link from "next/link";

const FEATURES: Record<Tier, string[]> = {
  FREE: ["Basic access", "Community support"],
  BASIC: ["Everything in Free", "Priority support", "Basic analytics"],
  MEDIUM: [
    "Everything in Basic",
    "Post stats & reaction breakdown",
    "VIP room access",
    "Suggested friends",
  ],
  PREMIUM: [
    "Everything in Medium",
    "Who-reacted list",
    "Export data",
    "Crown badge",
    "Dedicated support",
  ],
};

const PRICES: Record<Tier, string> = {
  FREE: "$0",
  BASIC: "$9.99/mo",
  MEDIUM: "$19.99/mo",
  PREMIUM: "$49.99/mo",
};

function TierCard({
  tier,
  price,
  features,
  current,
  ctaLabel,
  ctaHref,
}: {
  tier: Tier;
  price: string;
  features: string[];
  current?: boolean;
  ctaLabel: string;
  ctaHref?: string;
}) {
  return (
    <div
      className={`flex flex-col rounded-xl border p-6 ${
        current ? "border-brand ring-brand/20 ring-2" : "border-border"
      }`}
    >
      <h3 className="text-lg font-semibold">{tierLabel(tier)}</h3>
      <p className="mt-1 text-2xl font-bold text-muted">{price}</p>
      <ul className="mt-4 flex flex-col gap-2">
        {features.map((f) => (
          <li key={f} className="text-sm text-muted">
            {f}
          </li>
        ))}
      </ul>
      <div className="mt-6">
        {current ? (
          <span className="block rounded-lg bg-surface px-4 py-2 text-center text-sm font-medium text-muted">
            Current plan
          </span>
        ) : ctaHref ? (
          <Link
            href={ctaHref}
            className="block rounded-lg bg-brand px-4 py-2 text-center text-sm font-medium text-white hover:bg-brand/90"
          >
            {ctaLabel}
          </Link>
        ) : (
          <span className="block rounded-lg bg-surface px-4 py-2 text-center text-sm font-medium text-muted">
            {ctaLabel}
          </span>
        )}
      </div>
    </div>
  );
}

export default function PricingPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1
          data-testid="page-heading"
          className="text-2xl font-semibold tracking-tight"
        >
          Pricing
        </h1>
        <p className="text-sm text-muted">
          Choose the plan that fits your needs.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {TIERS.map((tier) => {
          const isCurrent = tier === user?.tier;
          const hasAccess = user?.tier && tierAtLeast(user.tier, tier);
          const isUpgrade =
            user?.tier && !hasAccess && tier !== user.tier;

          return (
            <TierCard
              key={tier}
              tier={tier}
              price={PRICES[tier]}
              features={FEATURES[tier]}
              current={isCurrent}
              ctaLabel={
                isCurrent
                  ? "Current plan"
                  : hasAccess
                    ? "Included"
                    : "Upgrade"
              }
              ctaHref={
                isUpgrade && user ? checkoutPath(tier) : undefined
              }
            />
          );
        })}
      </div>
    </div>
  );
}
