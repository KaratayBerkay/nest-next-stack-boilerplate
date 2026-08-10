"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { plansPath } from "@/constants/routes";
import type { UpgradeActionsProps } from "@/types/settings/UpgradeActions-types";

export default function UpgradeActions({ tier, t, lang }: UpgradeActionsProps) {
  return (
    <>
      {tier !== "FREE" && (
        <Card variant="surface" className="flex justify-center p-3">
          <Link
            href={`/v1/${lang}/settings/billing`}
            className="text-muted hover:text-foreground text-sm underline underline-offset-2"
          >
            {t.navBilling}
          </Link>
        </Card>
      )}

      {tier === "FREE" && (
        <Button asChild className="mt-2 w-full">
          <Link href={plansPath(lang)}>{t.upgradePlan}</Link>
        </Button>
      )}
    </>
  );
}
