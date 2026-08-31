"use client";

import { useId, useState } from "react";
import { IconCheck } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithPricingMessages } from "@/types/pages/pricing/PricingMessages-types";

const CHECKOUT_URL = "https://example.com/checkout";
const BASE_PRICE = 49;

const PLAN_FEATURE_KEYS = [
  "pricing4PlanFeature1",
  "pricing4PlanFeature2",
  "pricing4PlanFeature3",
  "pricing4PlanFeature4",
] as const;

interface AddonDef {
  id: string;
  nameKey: string;
  descriptionKey: string;
  price: number;
}

const ADDONS: AddonDef[] = [
  {
    id: "backups",
    nameKey: "pricing4AddonBackupsName",
    descriptionKey: "pricing4AddonBackupsDescription",
    price: 12,
  },
  {
    id: "support",
    nameKey: "pricing4AddonSupportName",
    descriptionKey: "pricing4AddonSupportDescription",
    price: 19,
  },
  {
    id: "storage",
    nameKey: "pricing4AddonStorageName",
    descriptionKey: "pricing4AddonStorageDescription",
    price: 9,
  },
  {
    id: "domain",
    nameKey: "pricing4AddonDomainName",
    descriptionKey: "pricing4AddonDomainDescription",
    price: 6,
  },
];

function formatPrice(value: number): string {
  return `$${value}`;
}

function AddonRow({
  name,
  description,
  priceLabel,
  checked,
  onChange,
}: {
  name: string;
  description: string;
  priceLabel: string;
  checked: boolean;
  onChange: () => void;
}) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start justify-between gap-4 rounded-xl border p-4 transition-colors",
        checked
          ? "border-brand bg-brand/5"
          : "border-border hover:bg-surface-hover",
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox id={id} checked={checked} onChange={onChange} />
        <div>
          <div className="text-fg text-sm font-medium">{name}</div>
          <div className="text-muted text-xs">{description}</div>
        </div>
      </div>
      <span className="text-fg shrink-0 text-sm font-semibold whitespace-nowrap">
        {priceLabel}
      </span>
    </label>
  );
}

export function SinglePlanAddonsPricing() {
  const t = useMessages("pages") as unknown as PagesWithPricingMessages;
  const p = t.pricing;
  const [selectedIds, setSelectedIds] = useState<string[]>(["backups"]);

  const toggleAddon = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  };

  const addonsTotal = ADDONS.filter((addon) =>
    selectedIds.includes(addon.id),
  ).reduce((sum, addon) => sum + addon.price, 0);
  const grandTotal = BASE_PRICE + addonsTotal;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-4 lg:px-6">
        <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-4 text-center">
          <Badge variant="soft">{p.pricing4Badge}</Badge>
          <Typography
            variant="h2"
            className="text-4xl font-semibold tracking-tight lg:text-5xl"
          >
            {p.pricing4Title}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {p.pricing4Description}
          </Typography>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-2">
            <CardHeader>
              <Typography variant="h4">{p.pricing4PlanName}</Typography>
              <Typography variant="bodySmall" className="text-muted">
                {p.pricing4PlanDescription}
              </Typography>
            </CardHeader>
            <CardContent>
              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-fg text-4xl font-semibold tracking-tight">
                  {formatPrice(BASE_PRICE)}
                </span>
                <span className="text-muted text-sm">
                  {p.pricing4PerMonthSuffix}
                </span>
              </div>
              <ul className="flex flex-col gap-3">
                {PLAN_FEATURE_KEYS.map((featureKey) => (
                  <li key={featureKey} className="flex items-start gap-2.5 text-sm">
                    <IconCheck size={18} className="text-brand mt-0.5 shrink-0" />
                    <span className="text-fg">{p[featureKey]}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <div className="flex flex-col gap-4 lg:col-span-3">
            <div>
              <Typography variant="h5">{p.pricing4AddonsHeading}</Typography>
              <Typography variant="bodySmall" className="text-muted">
                {p.pricing4AddonsDescription}
              </Typography>
            </div>
            <div className="flex flex-col gap-3">
              {ADDONS.map((addon) => (
                <AddonRow
                  key={addon.id}
                  name={p[addon.nameKey]}
                  description={p[addon.descriptionKey]}
                  priceLabel={`+${formatPrice(addon.price)}${p.pricing4PerMonthSuffix}`}
                  checked={selectedIds.includes(addon.id)}
                  onChange={() => toggleAddon(addon.id)}
                />
              ))}
            </div>
            <Card variant="surface">
              <CardContent className="flex flex-col gap-3 pt-4">
                <div className="flex items-center justify-between">
                  <Typography variant="body" className="text-muted text-sm">
                    {p.pricing4TotalLabel}
                  </Typography>
                  <span className="text-fg text-2xl font-semibold tracking-tight">
                    {formatPrice(grandTotal)}
                    <span className="text-muted ml-1 text-sm font-normal">
                      {p.pricing4PerMonthSuffix}
                    </span>
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="primary" className="w-full">
                  <a href={CHECKOUT_URL}>{p.pricing4Cta}</a>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
