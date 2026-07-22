"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LoadingAuth } from "@/components/LoadingAuth";
import { UnauthenticatedMessage } from "@/components/UnauthenticatedMessage";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { type Tier } from "@/lib/tier";
import { cn } from "@/lib/cn";
import type { ClassNameProps } from "@/types/ui/ClassName-types";
import { PageHeader } from "@/components/ui";
import { PageInfoButton } from "@/components/ui/page-info";
import { settingsBillingPageInfo } from "@/constants/page-info";
import { useQuery } from "@tanstack/react-query";
import {
  subscriptionQueryOptions,
  billingHistoryQueryOptions,
} from "@/api/client/billing/query";
import { billingAddressQueryOptions } from "@/api/client/billing/address";
import type { Transaction, SubscriptionInfo } from "@/types/billing/FreePageView-types";
import type { BillingAddress } from "@/api/server/billing/address";
import { PlanDetails } from "./PlanDetails";
import { PlanBenefits } from "./PlanBenefits";
import { PaymentMethods } from "./PaymentMethods";
import { InvoiceTable } from "./InvoiceTable";
import { BillingAddressForm } from "./BillingAddressForm";
import { BillingInfoDisplay } from "./BillingInfoDisplay";

export function FreePageView({ className }: ClassNameProps) {
  const { user, loading } = useAuth();
  const t = useMessages("settings");
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const { data: subData } = useQuery(subscriptionQueryOptions(user?.id));
  const subscription = (subData as unknown as SubscriptionInfo | null) ?? null;

  const { data: historyData, isLoading: loadingHistory } = useQuery({
    ...billingHistoryQueryOptions(),
    enabled: !!user,
  });
  const transactions = (historyData as Transaction[] | undefined) ?? [];

  const { data: addressData } = useQuery(billingAddressQueryOptions());
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
            <PlanDetails
              tier={tier}
              periodEnd={subscription?.periodEnd}
              cancelAtPeriodEnd={subscription?.cancelAtPeriodEnd ?? false}
            />
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
              <BillingInfoDisplay
                address={address}
                onEdit={() => setIsEditingAddress(true)}
              />
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
