"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { tiers } from "./PricingTiers-data";
import { FeatureComparisonTable } from "./FeatureComparisonTable";

export function PricingTiersTab() {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="isolate grid grid-cols-1 gap-6 md:grid-cols-3">
        {tiers.map((tier) => {
          const isSelected = selectedTier === tier.name;
          return (
            <button
              key={tier.name}
              type="button"
              onClick={() => setSelectedTier(isSelected ? null : tier.name)}
              className={cn(
                "flex cursor-pointer flex-col rounded-xl border p-8 text-left transition-all duration-200",
                "hover:shadow-md",
                isSelected
                  ? "border-brand ring-brand/50 scale-[1.02] shadow-lg ring-2"
                  : tier.popular
                    ? "border-brand/50 bg-surface ring-brand/20 relative ring-1"
                    : "border-border bg-surface",
              )}
            >
              {tier.popular && !isSelected && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most popular
                </Badge>
              )}
              {isSelected && (
                <Badge
                  variant="success"
                  className="absolute -top-3 left-1/2 -translate-x-1/2"
                >
                  Selected
                </Badge>
              )}

              <div className="mb-4 flex items-center gap-3">
                {tier.logos.map((logo) => (
                  <span
                    key={logo}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-colors",
                      isSelected
                        ? "bg-brand/15 text-brand"
                        : "bg-muted/30 text-muted",
                    )}
                  >
                    {logo[0]}
                  </span>
                ))}
              </div>

              <h3 className="text-lg font-semibold">{tier.name}</h3>
              <p className="text-muted mt-1 text-sm">{tier.description}</p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight">
                  ${tier.price}
                </span>
                <span className="text-muted text-sm font-medium">/month</span>
              </div>

              <div
                className={cn(
                  "mt-8 w-full rounded-lg py-2.5 text-center text-sm font-medium transition-colors",
                  isSelected
                    ? "bg-brand text-brand-fg"
                    : tier.popular
                      ? "bg-brand text-brand-fg"
                      : "border-border text-fg border",
                )}
              >
                {isSelected ? "Selected" : tier.cta}
              </div>

              <p className="text-muted mt-3 text-center text-xs">
                14-day free trial &middot; No credit card required
              </p>
            </button>
          );
        })}
      </div>

      {selectedTier && (
        <div className="mt-8 flex justify-center">
          <Button size="lg" className="px-12">
            Pay for {selectedTier}
          </Button>
        </div>
      )}

      <FeatureComparisonTable selectedTier={selectedTier} />
    </div>
  );
}
