"use client";

import Link from "next/link";
import { IconCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFooterMessages } from "@/types/pages/footer/FooterMessages-types";

const PLAN_CHECKS = [
  "footer9PlanCheck1",
  "footer9PlanCheck2",
  "footer9PlanCheck3",
] as const;
const COLUMNS = [
  {
    id: "product",
    titleKey: "footer9ColProductTitle",
    linkKeys: ["footer9ColProductLink1", "footer9ColProductLink2"],
  },
  {
    id: "company",
    titleKey: "footer9ColCompanyTitle",
    linkKeys: ["footer9ColCompanyLink1", "footer9ColCompanyLink2"],
  },
] as const;

export function PricingCtaFooter() {
  const t = useMessages("pages") as unknown as PagesWithFooterMessages;
  const f = t.footer;

  return (
    <footer className="border-border bg-surface w-full border-t py-16">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div className="flex flex-col gap-4">
            <h3 className="text-fg text-2xl font-semibold tracking-tight">
              {f.footer9CtaHeading}
            </h3>
            <p className="text-muted text-sm leading-relaxed">
              {f.footer9CtaBody}
            </p>
            <Button asChild variant="primary" className="w-fit">
              <Link href="#">{f.footer9CtaButton}</Link>
            </Button>
          </div>
          <div className="border-border bg-bg flex flex-col gap-4 rounded-xl border p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2">
              <span className="text-fg text-lg font-semibold">
                {f.footer9PlanName}
              </span>
              <ul className="flex flex-col gap-1.5">
                {PLAN_CHECKS.map((key) => (
                  <li
                    key={key}
                    className="text-muted flex items-center gap-2 text-sm"
                  >
                    <IconCheck
                      size={14}
                      className="text-success"
                      aria-hidden="true"
                    />
                    {f[key]}
                  </li>
                ))}
              </ul>
            </div>
            <span className="text-fg text-2xl font-semibold whitespace-nowrap">
              {f.footer9PlanPrice}
            </span>
          </div>
        </div>
        <div className="border-border mt-12 grid gap-8 border-t pt-8 sm:grid-cols-2">
          {COLUMNS.map((col) => (
            <div key={col.id} className="flex flex-col gap-2.5">
              <span className="text-fg text-sm font-semibold">
                {f[col.titleKey]}
              </span>
              <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                {col.linkKeys.map((linkKey) => (
                  <Link
                    key={linkKey}
                    href="#"
                    className="text-muted hover:text-fg text-sm"
                  >
                    {f[linkKey]}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
