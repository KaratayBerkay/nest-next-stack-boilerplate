"use client";

import { useId, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithServicesMessages } from "@/types/pages/services/ServicesMessages-types";

interface PackageService {
  id: string;
  nameKey: string;
  descriptionKey: string;
  priceLabelKey: string;
  priceValue: number;
}

const SERVICES: PackageService[] = [
  {
    id: "strategy",
    nameKey: "services8Service1Name",
    descriptionKey: "services8Service1Description",
    priceLabelKey: "services8Service1PriceLabel",
    priceValue: 90,
  },
  {
    id: "design",
    nameKey: "services8Service2Name",
    descriptionKey: "services8Service2Description",
    priceLabelKey: "services8Service2PriceLabel",
    priceValue: 150,
  },
  {
    id: "development",
    nameKey: "services8Service3Name",
    descriptionKey: "services8Service3Description",
    priceLabelKey: "services8Service3PriceLabel",
    priceValue: 220,
  },
  {
    id: "content",
    nameKey: "services8Service4Name",
    descriptionKey: "services8Service4Description",
    priceLabelKey: "services8Service4PriceLabel",
    priceValue: 80,
  },
  {
    id: "analytics",
    nameKey: "services8Service5Name",
    descriptionKey: "services8Service5Description",
    priceLabelKey: "services8Service5PriceLabel",
    priceValue: 60,
  },
  {
    id: "support",
    nameKey: "services8Service6Name",
    descriptionKey: "services8Service6Description",
    priceLabelKey: "services8Service6PriceLabel",
    priceValue: 40,
  },
];

export function PackageBuilderServices() {
  const t = useMessages("pages") as unknown as PagesWithServicesMessages;
  const s = t.services;
  const [selected, setSelected] = useState<string[]>([
    SERVICES[0].id,
    SERVICES[2].id,
  ]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((entry) => entry !== id) : [...prev, id],
    );
  };

  const total = useMemo(
    () =>
      SERVICES.filter((service) => selected.includes(service.id)).reduce(
        (sum, service) => sum + service.priceValue,
        0,
      ),
    [selected],
  );

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {s.services8Eyebrow}
          </span>
          <h2 className="text-fg max-w-xl text-3xl font-semibold tracking-tight lg:text-4xl">
            {s.services8Heading}
          </h2>
          <p className="text-muted max-w-xl leading-relaxed">
            {s.services8Intro}
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_300px] lg:gap-12">
          <ul className="flex flex-col gap-3">
            {SERVICES.map((service) => (
              <PackageRow
                key={service.id}
                checked={selected.includes(service.id)}
                onToggle={() => toggle(service.id)}
                name={s[service.nameKey]}
                description={s[service.descriptionKey]}
                priceLabel={s[service.priceLabelKey]}
              />
            ))}
          </ul>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <Card variant="elevated">
              <CardHeader>
                <span className="text-fg text-sm font-semibold tracking-wide uppercase">
                  {s.services8SummaryTitle}
                </span>
              </CardHeader>
              <CardContent>
                {selected.length === 0 ? (
                  <p className="text-muted text-sm leading-relaxed">
                    {s.services8EmptyState}
                  </p>
                ) : (
                  <>
                    <p className="text-muted text-sm">
                      {s.services8ItemCountTemplate.replace(
                        "{count}",
                        String(selected.length),
                      )}
                    </p>
                    <div className="border-border mt-4 flex items-baseline justify-between border-t pt-4">
                      <span className="text-muted text-sm">
                        {s.services8TotalLabel}
                      </span>
                      <span className="text-fg text-2xl font-semibold tracking-tight tabular-nums">
                        {s.services8TotalTemplate.replace(
                          "{amount}",
                          String(total),
                        )}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  variant="primary"
                  className="w-full justify-center"
                  disabled={selected.length === 0}
                >
                  {s.services8Cta}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

interface PackageRowProps {
  checked: boolean;
  onToggle: () => void;
  name: string;
  description: string;
  priceLabel: string;
}

function PackageRow({
  checked,
  onToggle,
  name,
  description,
  priceLabel,
}: PackageRowProps) {
  const inputId = useId();

  return (
    <li>
      <label
        htmlFor={inputId}
        className={cn(
          "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors",
          checked
            ? "border-brand bg-brand/5"
            : "border-border bg-bg hover:bg-surface-hover",
        )}
      >
        <input
          id={inputId}
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="sr-only"
        />
        <span
          className={cn(
            "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-[5px] border transition-colors",
            checked ? "border-brand bg-brand" : "border-border bg-bg",
          )}
          aria-hidden="true"
        >
          {checked && (
            <svg
              className="text-brand-fg size-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          )}
        </span>
        <span className="flex min-w-0 flex-1 items-start justify-between gap-3">
          <span className="flex flex-col gap-0.5">
            <span className="text-fg text-sm font-semibold">{name}</span>
            <span className="text-muted text-sm">{description}</span>
          </span>
          <span className="text-fg shrink-0 text-sm font-medium tabular-nums">
            {priceLabel}
          </span>
        </span>
      </label>
    </li>
  );
}
