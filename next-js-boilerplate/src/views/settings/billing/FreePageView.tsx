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
import { Card } from "@/components/ui/card";
import { PageInfoButton } from "@/components/ui/page-info";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { settingsBillingPageInfo } from "@/constants/page-info";
import { useQuery } from "@tanstack/react-query";
import {
  subscriptionQueryOptions,
  billingHistoryQueryOptions,
} from "@/api/client/billing/query";
import { billingAddressQueryOptions } from "@/api/client/billing/address";
import type { SubscriptionInfo } from "@/types/billing/FreePageView-types";
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
  const transactions = historyData ?? [];

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

      <Tabs defaultValue="plan" className="flex w-full flex-col gap-6">
        <TabsList className="w-fit">
          <TabsTrigger value="plan">{t.billingPlanTab}</TabsTrigger>
          <TabsTrigger value="invoices">{t.invoices}</TabsTrigger>
        </TabsList>

        <TabsContent value="plan" className="flex flex-col gap-6">
          <div className="flex flex-col gap-6 xl:flex-row">
            <div className="flex flex-1 flex-col gap-6">
              <Card variant="surface" className="p-5">
                <PlanDetails
                  tier={tier}
                  periodEnd={subscription?.periodEnd}
                  cancelAtPeriodEnd={subscription?.cancelAtPeriodEnd ?? false}
                  pendingTier={subscription?.pendingTier}
                  pendingTierEffectiveAt={subscription?.pendingTierEffectiveAt}
                />
              </Card>

              <Card variant="surface" className="p-5">
                <PlanBenefits currentTier={tier} />
              </Card>

              <Card variant="surface" className="p-5">
                <PaymentMethods />
              </Card>
            </div>

            <div className="flex w-full flex-col gap-6 xl:w-80">
              <Card variant="surface" className="p-5">
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
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="flex flex-col gap-6">
          <Card variant="surface" className="p-5">
            <InvoiceTable
              transactions={transactions}
              isLoading={loadingHistory}
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
