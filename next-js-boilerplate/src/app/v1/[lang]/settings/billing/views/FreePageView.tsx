"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { LoadingAuth } from "@/components/LoadingAuth";
import { UnauthenticatedMessage } from "@/components/UnauthenticatedMessage";
import { apiFetchJson } from "@/lib/api-client";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { TIER_PRICES, tierLabel } from "@/lib/tier";
import { PRICING_PATH } from "@/constants/routes";
import { formatDate } from "@/lib/date-time";

interface Transaction {
  id: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  reference: string;
  createdAt: string;
}

export function FreePageView() {
  const { user, loading } = useAuth();
  const t = useMessages("settings");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (!user) return;
    apiFetchJson<{ transactions: Transaction[] }>("/api/billing/history")
      .then((data) => setTransactions(data.transactions))
      .catch(() => setTransactions([]))
      .finally(() => setLoadingHistory(false));
  }, [user]);

  if (loading) return <LoadingAuth />;
  if (!user) return <UnauthenticatedMessage message="Sign in to manage billing" />;

  const tier = user.tier ?? "FREE";

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <h2 className="text-lg font-semibold">{t.billingHeading}</h2>

      <div className="border-border bg-surface flex items-center justify-between rounded-lg border p-4">
        <div>
          <p className="text-sm text-muted">{t.currentPlan}</p>
          <p className="text-lg font-bold">{tierLabel(tier)}</p>
          <p className="text-sm text-muted">{TIER_PRICES[tier] ?? "Free"}</p>
        </div>
        {tier === "FREE" ? (
          <Link
            href={PRICING_PATH}
            className="bg-brand rounded-lg px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            {t.upgradePlan}
          </Link>
        ) : (
          <Link
            href={PRICING_PATH}
            className="border-border rounded-lg border px-4 py-2 text-sm font-medium hover:bg-surface-hover"
          >
            {t.upgradePlan}
          </Link>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-medium">{t.billingHistory}</h3>
        {loadingHistory ? (
          <p className="text-sm text-muted">{t.loading}</p>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-muted">{t.billingHistoryEmpty}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="border-border bg-surface flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="text-xs text-muted">
                    {formatDate(tx.createdAt)}
                  </p>
                  <p className="text-sm font-medium">{tx.reference.replace("subscription:", "")}</p>
                </div>
                <span
                  className={`text-xs font-medium ${
                    tx.status === "COMPLETED" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {tx.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
