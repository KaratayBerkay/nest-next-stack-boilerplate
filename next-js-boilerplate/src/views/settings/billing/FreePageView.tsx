"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { LoadingAuth } from "@/components/LoadingAuth";
import { UnauthenticatedMessage } from "@/components/UnauthenticatedMessage";
import { apiFetchJson } from "@/lib/api-client";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { TIER_PRICES_CENTS, tierLabel, type Tier } from "@/lib/tier";
import { formatPrice } from "@/lib/currency";
import { useCurrencyCookie } from "@/hooks/useCurrencyCookie";
import { useDateDisplayCookie } from "@/hooks/useDateDisplayCookie";
import { plansPath } from "@/constants/routes";
import { formatDateByPreference, type DateDisplayPreference } from "@/lib/date-time";
import type { CurrencyCode } from "@/constants/currency";
import {
  BILLING_SUBSCRIPTION_URL,
  BILLING_HISTORY_URL,
} from "@/constants/api/urls";
import { PageInfoButton } from "@/components/ui/page-info";
import { settingsBillingPageInfo } from "@/constants/page-info";

interface Transaction {
  id: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  reference: string;
  stripeInvoiceUrl?: string;
  createdAt: string;
}

interface SubscriptionInfo {
  tier: string;
  priceCents: number;
  currency: string;
  periodStart: string;
  periodEnd: string;
  cancelAtPeriodEnd: boolean;
}

function renderCurrentPlan(
  tier: Tier,
  periodEnd: string | undefined,
  cancelAtPeriodEnd: boolean,
  t: Record<string, string>,
  currency: CurrencyCode,
  dateDisplay: DateDisplayPreference,
) {
  return (
    <div className="border-border bg-surface flex items-center justify-between rounded-lg border p-4">
      <div>
        <p className="text-muted text-sm">{t.currentPlan}</p>
        <p className="text-lg font-bold">{tierLabel(tier)}</p>
        <p className="text-muted text-sm">
          {formatPrice(TIER_PRICES_CENTS[tier] ?? 0, currency)}
        </p>
        {tier !== "FREE" && periodEnd && (
          <p className="text-muted mt-1 text-xs">
            {cancelAtPeriodEnd
              ? `Cancels on ${formatDateByPreference(periodEnd, dateDisplay)}`
              : `Next payment: ${formatDateByPreference(periodEnd, dateDisplay)}`}
          </p>
        )}
      </div>
      {tier === "FREE" ? (
        <Link
          href={plansPath()}
          className="bg-brand rounded-lg px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          {t.upgradePlan}
        </Link>
      ) : (
        <Link
          href={plansPath()}
          className="border-border hover:bg-surface-hover rounded-lg border px-4 py-2 text-sm font-medium"
        >
          {t.upgradePlan}
        </Link>
      )}
    </div>
  );
}

function renderBillingHistory(
  loadingHistory: boolean,
  transactions: Transaction[],
  t: Record<string, string>,
  dateDisplay: DateDisplayPreference,
) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-medium">{t.billingHistory}</h3>
      {loadingHistory ? (
        <p className="text-muted text-sm">{t.loading}</p>
      ) : transactions.length === 0 ? (
        <p className="text-muted text-sm">{t.billingHistoryEmpty}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="border-border bg-surface flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <p className="text-muted text-xs">
                  {formatDateByPreference(tx.createdAt, dateDisplay)}
                </p>
                <p className="text-sm font-medium">
                  {tx.reference.replace("subscription:", "")}
                  {tx.amount > 0 && (
                    <span className="text-muted ml-1 text-xs">
                      — ${(tx.amount / 100).toFixed(2)}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-medium ${
                    tx.status === "COMPLETED"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {tx.status}
                </span>
                {tx.stripeInvoiceUrl && (
                  <a
                    href={tx.stripeInvoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 underline hover:text-blue-800"
                  >
                    Invoice
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function FreePageView() {
  const { user, loading } = useAuth();
  const t = useMessages("settings");
  const currency = useCurrencyCookie();
  const dateDisplay = useDateDisplayCookie();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(
    null,
  );
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingSub, setLoadingSub] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (!user) return;
    apiFetchJson<{ subscription: SubscriptionInfo | null }>(
      BILLING_SUBSCRIPTION_URL,
    )
      .then((data) => setSubscription(data.subscription))
      .catch(() => setSubscription(null))
      .finally(() => setLoadingSub(false));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    apiFetchJson<{ transactions: Transaction[] }>(BILLING_HISTORY_URL)
      .then((data) => setTransactions(data.transactions))
      .catch(() => setTransactions([]))
      .finally(() => setLoadingHistory(false));
  }, [user]);

  if (loading) return <LoadingAuth />;
  if (!user)
    return <UnauthenticatedMessage message={t.signInToManageBilling} />;

  const tier = (subscription?.tier as Tier) ?? (user.tier as Tier) ?? "FREE";
  const periodEnd = subscription?.periodEnd;
  const cancelAtPeriodEnd = subscription?.cancelAtPeriodEnd ?? false;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t.billingHeading}</h2>
        <PageInfoButton content={settingsBillingPageInfo} />
      </div>

      {renderCurrentPlan(tier, periodEnd, cancelAtPeriodEnd, t, currency, dateDisplay)}

      {renderBillingHistory(loadingHistory, transactions, t, dateDisplay)}
    </div>
  );
}
