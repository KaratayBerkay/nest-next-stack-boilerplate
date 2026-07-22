"use client";

import Link from "next/link";
import { plansPath } from "@/constants/routes";
import type { UpgradeActionsProps } from "@/types/settings/UpgradeActions-types";

export default function UpgradeActions({ tier, t, lang }: UpgradeActionsProps) {
  return (
    <>
      {tier !== "FREE" && (
        <div className="border-border flex justify-center rounded-lg border p-3">
          <Link
            href={`/v1/${lang}/settings/billing`}
            className="text-muted hover:text-foreground text-sm underline underline-offset-2"
          >
            {t.navBilling}
          </Link>
        </div>
      )}

      {tier === "FREE" && (
        <Link
          href={plansPath(lang)}
          className="bg-brand text-brand-fg mt-2 block rounded-lg px-4 py-2 text-center text-sm font-medium hover:opacity-90"
        >
          {t.upgradePlan}
        </Link>
      )}
    </>
  );
}
