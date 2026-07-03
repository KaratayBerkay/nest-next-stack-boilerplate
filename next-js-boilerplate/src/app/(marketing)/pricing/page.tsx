"use client";

import { useAuth } from "@/hooks/useAuth";
import { TIERS, tierLabel, tierAtLeast, type Tier } from "@/lib/tier";

const FEATURES: Record<Tier, string[]> = {
  FREE: ["Basic access", "Community support"],
  BASIC: ["Everything in Free", "Priority support", "Basic analytics"],
  MEDIUM: [
    "Everything in Basic",
    "Advanced analytics",
    "Team collaboration",
    "API access",
  ],
  PREMIUM: [
    "Everything in Medium",
    "Premium stats",
    "Dedicated support",
    "Custom integrations",
    "SLA guarantee",
  ],
};

function TierCard({
  tier,
  price,
  features,
  current,
  cta,
}: {
  tier: Tier;
  price: string;
  features: string[];
  current?: boolean;
  cta?: string;
}) {
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
      <div className="mt-6">
        {current ? (
          <span className="bg-surface text-muted block rounded-lg px-4 py-2 text-center text-sm font-medium">
            Current plan
          </span>
        ) : (
          <span className="bg-brand block rounded-lg px-4 py-2 text-center text-sm font-medium text-white">
            {cta ?? "Choose plan"}
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
        <p className="text-muted text-sm">
          Choose the plan that fits your needs.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {TIERS.map((tier) => (
          <TierCard
            key={tier}
            tier={tier}
            price={
              tier === "FREE"
                ? "$0"
                : tier === "BASIC"
                  ? "$9"
                  : tier === "MEDIUM"
                    ? "$29"
                    : "$99"
            }
            features={FEATURES[tier]}
            current={tier === user?.tier}
            cta={
              user?.tier
                ? tierAtLeast(user.tier, tier)
                  ? "Included"
                  : "Upgrade"
                : "Get started"
            }
          />
        ))}
      </div>
    </div>
  );
}
