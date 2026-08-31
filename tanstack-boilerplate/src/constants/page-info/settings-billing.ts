import type { PageInfoContent } from "@/types/ui/PageInfo-types";

export const settingsBillingPageInfo: PageInfoContent = {
  title: "Billing",
  description:
    "Manage your subscription, payment methods, and billing history.",
  sections: [
    {
      title: "Subscription",
      description:
        "View your current plan, next billing date, and renewal status.",
    },
    {
      title: "Payment Methods",
      description:
        "Add, update, or remove payment methods for your subscription.",
    },
    {
      title: "Billing History",
      description: "View past invoices and payment receipts.",
    },
    {
      title: "Cancel Subscription",
      description:
        "Cancel your subscription to downgrade at the end of the current billing period.",
    },
  ],
  tips: [
    "You can update your payment method anytime before the next billing date",
  ],
};
