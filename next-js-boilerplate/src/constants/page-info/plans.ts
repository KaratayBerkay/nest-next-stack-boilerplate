import type { PageInfoContent } from "@/types/ui/PageInfo-types";

export const plansPageInfo: PageInfoContent = {
  title: "Plans",
  description:
    "Compare and choose the plan that works best for you.",
  sections: [
    {
      title: "Plan Tiers",
      description:
        "We offer Free, Basic, Medium, and Premium plans. Each tier unlocks additional features and higher limits.",
    },
    {
      title: "Features",
      description:
        "Each plan includes different features. Higher tiers get priority support, advanced analytics, and more.",
    },
    {
      title: "Upgrading",
      description:
        "Choose a plan and complete the checkout process. You can upgrade or downgrade at any time.",
    },
    {
      title: "Billing",
      description:
        "Plans are billed monthly. You can manage your subscription and payment methods in Settings > Billing.",
    },
  ],
  tips: [
    "Your current plan is shown in Settings",
    "Upgrades take effect immediately",
  ],
};
