"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { LoadingAuth } from "@/components/LoadingAuth";
import { UnauthenticatedMessage } from "@/components/UnauthenticatedMessage";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { TIER_PRICES_CENTS, tierLabel, type Tier } from "@/lib/tier";
import { formatPrice } from "@/lib/currency";
import { plansPath } from "@/constants/routes";
import { cn } from "@/lib/cn";
import { PageHeader } from "@/components/ui";
import { PageInfoButton } from "@/components/ui/page-info";
import { settingsBillingPageInfo } from "@/constants/page-info";
import { useQuery } from "@tanstack/react-query";
import {
  subscriptionQueryOptions,
  billingHistoryQueryOptions,
} from "@/api/client/billing/query";
import { billingAddressQueryOptions } from "@/api/client/billing/address";
import { PlanBenefits } from "./PlanBenefits";
import { PaymentMethods } from "./PaymentMethods";
import { InvoiceTable } from "./InvoiceTable";
import { BillingAddressForm } from "./BillingAddressForm";
import type { BillingAddress } from "@/api/server/billing/address";

export interface Transaction {
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

function renderPlanDetails(
  tier: Tier,
  periodEnd: string | undefined,
  cancelAtPeriodEnd: boolean,
  t: Record<string, string>,
) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-medium">Plan Details</h3>
      <ul className="divide-border flex flex-col divide-y">
        <li className="flex items-center justify-between py-2.5">
          <span className="text-muted text-sm">Current Plan</span>
          <span className="text-sm font-medium">{tierLabel(tier)}</span>
        </li>
        <li className="flex items-center justify-between py-2.5">
          <span className="text-muted text-sm">Price</span>
          <span className="text-sm font-medium">
            {formatPrice(TIER_PRICES_CENTS[tier] ?? 0, "USD")}
          </span>
        </li>
        {tier !== "FREE" && periodEnd && (
          <li className="flex items-center justify-between py-2.5">
            <span className="text-muted text-sm">
              {cancelAtPeriodEnd ? "Cancels on" : "Renewal Date"}
            </span>
            <span className="text-sm font-medium">{periodEnd}</span>
          </li>
        )}
      </ul>

      <div className="mt-4 flex items-center gap-2">
        {tier === "FREE" ? (
          <Link
            href={plansPath()}
            className="bg-brand text-brand-fg rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            {t.upgradePlan}
          </Link>
        ) : (
          <>
            <Link
              href={plansPath()}
              className="bg-brand text-brand-fg rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90"
            >
              {t.upgradePlan}
            </Link>
            {!cancelAtPeriodEnd && (
              <button
                type="button"
                className="border-border hover:bg-surface-hover rounded-lg border px-4 py-2 text-sm font-medium"
              >
                Cancel Subscription
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function renderBillingInfo(
  address: BillingAddress | null,
  isEditing: boolean,
  onEdit: () => void,
) {
  if (isEditing) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Billing Info</h3>
        <button
          type="button"
          onClick={onEdit}
          className="text-brand text-xs font-medium hover:underline"
        >
          Edit
        </button>
      </div>

      {!address ? (
        <p className="text-muted text-sm">No billing address saved.</p>
      ) : (
        <ul className="divide-border flex flex-col divide-y">
          {address.name && (
            <li className="flex items-center justify-between py-2.5">
              <span className="text-muted text-sm">Name</span>
              <span className="text-sm font-medium">{address.name}</span>
            </li>
          )}
          {address.street && (
            <li className="flex items-center justify-between py-2.5">
              <span className="text-muted text-sm">Street</span>
              <span className="text-sm font-medium">{address.street}</span>
            </li>
          )}
          {address.city && (
            <li className="flex items-center justify-between py-2.5">
              <span className="text-muted text-sm">City</span>
              <span className="text-sm font-medium">{address.city}</span>
            </li>
          )}
          {address.state && (
            <li className="flex items-center justify-between py-2.5">
              <span className="text-muted text-sm">State</span>
              <span className="text-sm font-medium">{address.state}</span>
            </li>
          )}
          {address.country && (
            <li className="flex items-center justify-between py-2.5">
              <span className="text-muted text-sm">Country</span>
              <span className="text-sm font-medium">{address.country}</span>
            </li>
          )}
          {address.zipCode && (
            <li className="flex items-center justify-between py-2.5">
              <span className="text-muted text-sm">Zip / Postal Code</span>
              <span className="text-sm font-medium">{address.zipCode}</span>
            </li>
          )}
          {address.vatNumber && (
            <li className="flex items-center justify-between py-2.5">
              <span className="text-muted text-sm">VAT Number</span>
              <span className="text-sm font-medium">{address.vatNumber}</span>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

function useBillingAddress() {
  return useQuery(billingAddressQueryOptions());
}

export function FreePageView({ className }: { className?: string }) {
  const { user, loading } = useAuth();
  const t = useMessages("settings");
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const { data: subData, isLoading: _loadingSub } = useQuery(
    subscriptionQueryOptions(user?.id),
  );
  const subscription = (subData as unknown as SubscriptionInfo | null) ?? null;

  const { data: historyData, isLoading: loadingHistory } = useQuery({
    ...billingHistoryQueryOptions(),
    enabled: !!user,
  });
  const transactions = (historyData as Transaction[] | undefined) ?? [];

  const { data: addressData } = useBillingAddress();
  const address = (addressData as BillingAddress | null) ?? null;

  if (loading) return <LoadingAuth />;
  if (!user)
    return <UnauthenticatedMessage message={t.signInToManageBilling} />;

  const tier = (subscription?.tier as Tier) ?? (user.tier as Tier) ?? "FREE";

  return (
    <div className={cn("flex h-full w-full flex-col gap-6", className)}>
      <PageHeader
        title={t.billingHeading}
        actions={<PageInfoButton content={settingsBillingPageInfo} />}
      />

      <div className="flex flex-col gap-6 xl:flex-row">
        <div className="flex flex-1 flex-col gap-6">
          <div className="border-border bg-surface rounded-xl border p-5">
            {renderPlanDetails(
              tier,
              subscription?.periodEnd,
              subscription?.cancelAtPeriodEnd ?? false,
              t as unknown as Record<string, string>,
            )}
          </div>

          <div className="border-border bg-surface rounded-xl border p-5">
            <PlanBenefits currentTier={tier} />
          </div>

          <div className="border-border bg-surface rounded-xl border p-5">
            <PaymentMethods />
          </div>
        </div>

        <div className="flex w-full flex-col gap-6 xl:w-80">
          <div className="border-border bg-surface rounded-xl border p-5">
            {isEditingAddress ? (
              <BillingAddressForm
                address={address}
                onSave={() => setIsEditingAddress(false)}
                onCancel={() => setIsEditingAddress(false)}
              />
            ) : (
              renderBillingInfo(address, isEditingAddress, () =>
                setIsEditingAddress(true),
              )
            )}
          </div>
        </div>
      </div>

      <div className="border-border bg-surface rounded-xl border p-5">
        <InvoiceTable transactions={transactions} isLoading={loadingHistory} />
      </div>
    </div>
  );
}
