"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { LoadingAuth } from "@/components/LoadingAuth";
import { UnauthenticatedMessage } from "@/components/UnauthenticatedMessage";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { TIER_PRICES_CENTS, tierLabel, type Tier } from "@/lib/tier";
import { formatPrice } from "@/lib/currency";
import { useCurrencyCookie } from "@/hooks/useCurrencyCookie";
import { useDateDisplayCookie } from "@/hooks/useDateDisplayCookie";
import { plansPath } from "@/constants/routes";
import { cn } from "@/lib/cn";
import {
  formatDateByPreference,
  type DateDisplayPreference,
} from "@/lib/date-time";
import type { CurrencyCode } from "@/constants/currency";
import { PageHeader } from "@/components/ui";
import { PageInfoButton } from "@/components/ui/page-info";
import { settingsBillingPageInfo } from "@/constants/page-info";
import { useQuery } from "@tanstack/react-query";
import {
  subscriptionQueryOptions,
  billingHistoryQueryOptions,
} from "@/api/client/billing/query";

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
          className="bg-brand text-brand-fg rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90"
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

export function FreePageView({ className }: { className?: string }) {
  const { user, loading } = useAuth();
  const t = useMessages("settings");
  const currency = useCurrencyCookie();
  const dateDisplay = useDateDisplayCookie();

  const { data: subData, isLoading: _loadingSub } = useQuery(
    subscriptionQueryOptions(user?.id),
  );
  const subscription = (subData as unknown as SubscriptionInfo | null) ?? null;

  const { data: historyData, isLoading: loadingHistory } = useQuery({
    ...billingHistoryQueryOptions(),
    enabled: !!user,
  });
  const transactions = (historyData as Transaction[] | undefined) ?? [];

  if (loading) return <LoadingAuth />;
  if (!user)
    return <UnauthenticatedMessage message={t.signInToManageBilling} />;

  const tier = (subscription?.tier as Tier) ?? (user.tier as Tier) ?? "FREE";
  const periodEnd = subscription?.periodEnd;
  const cancelAtPeriodEnd = subscription?.cancelAtPeriodEnd ?? false;

  return (
    <div className={cn("flex h-full w-full flex-col gap-6", className)}>
      <PageHeader
        title={t.billingHeading}
        actions={<PageInfoButton content={settingsBillingPageInfo} />}
      />

      {renderCurrentPlan(
        tier,
        periodEnd,
        cancelAtPeriodEnd,
        t as unknown as Record<string, string>,
        currency,
        dateDisplay,
      )}

      {renderBillingHistory(
        loadingHistory,
        transactions,
        t as unknown as Record<string, string>,
        dateDisplay,
      )}
    </div>
  );
}
