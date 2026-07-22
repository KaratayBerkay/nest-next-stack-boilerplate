"use client";

import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/ui/PageContent-types";
import { LoginTab } from "./LoginTab";
import { RegisterTab } from "./RegisterTab";
import { ProfileCardTab } from "./ProfileCardTab";
import { StatsDashboardTab } from "./StatsDashboardTab";
import { FeatureCardsTab } from "./FeatureCardsTab";
import { PricingTiersTab } from "./PricingTiersTab";
import { VariantGalleryTab } from "./VariantGalleryTab";

export default function CardPage({ initialTab }: InitialTabProps) {
  const examples: UIExample[] = [
    {
      id: "profile-card",
      title: "Profile Card",
      description: "Profile card with avatar, badges, and action buttons.",
      render: () => <ProfileCardTab />,
    },
    {
      id: "stats-dashboard",
      title: "Stats Dashboard",
      description:
        "Stats cards showing revenue, subscriptions, and active users.",
      render: () => <StatsDashboardTab />,
    },
    {
      id: "feature-cards",
      title: "Feature Cards",
      description: "Feature highlight cards in a responsive grid.",
      render: () => <FeatureCardsTab />,
    },
    {
      id: "login",
      title: "Login",
      description:
        "Login card with email, password, remember-me, and validation.",
      render: () => <LoginTab />,
    },
    {
      id: "register",
      title: "Register",
      description:
        "Registration form with personal information fields and social login.",
      render: () => <RegisterTab />,
    },
    {
      id: "pricing-tiers",
      title: "Pricing Tiers",
      description:
        "Three-column pricing grid with a highlighted Professional plan.",
      render: () => <PricingTiersTab />,
    },
    {
      id: "variant-gallery",
      title: "Variant Gallery",
      description:
        "All card variants and sizes in a side-by-side comparison table.",
      render: () => <VariantGalleryTab />,
    },
  ];

  return (
    <ExampleTabs
      title="Card"
      intro="A container component with header, content, and footer sections."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
