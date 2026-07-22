"use client";

import { Checkbox } from "@/components/ui/Checkbox";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { VariantGallery } from "@/views/ui/_shared/VariantGallery";
import { TermsConsentTab } from "@/views/ui/checkbox/TermsConsentTab";
import { SelectAllTab } from "@/views/ui/checkbox/SelectAllTab";
import { PlanCardsTab } from "@/views/ui/checkbox/PlanCardsTab";
import { InterestChipsTab } from "@/views/ui/checkbox/InterestChipsTab";
import type { CheckboxVariant, CheckboxSize } from "@/types/ui/Checkbox-types";
import type { UIExample } from "@/types/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/ui/PageContent-types";

const examples: UIExample[] = [
  {
    id: "terms-consent",
    title: "Terms Consent",
    description: "Single checkbox with indeterminate state and group.",
    render: () => <TermsConsentTab />,
  },
  {
    id: "select-all",
    title: "Select All",
    description: "Real indeterminate checkbox driving a todo list.",
    render: () => <SelectAllTab />,
  },
  {
    id: "plan-cards",
    title: "Plan Cards",
    description: "CheckboxCard grid acting as a radio-like selector.",
    render: () => <PlanCardsTab />,
  },
  {
    id: "interest-chips",
    title: "Interest Chips",
    description: "CheckboxChip set for filter-style toggles.",
    render: () => <InterestChipsTab />,
  },
  {
    id: "variant-gallery",
    title: "Variant Gallery",
    description: "All variants and sizes.",
    render: () => (
      <VariantGallery
        variants={["default", "shiny", "glass", "neon", "gradient"]}
        sizes={["sm", "md", "lg"]}
        render={(variant, size) => (
          <Checkbox
            variant={variant as CheckboxVariant}
            size={size as CheckboxSize}
          />
        )}
      />
    ),
  },
];

export default function CheckboxPage({ initialTab }: InitialTabProps) {
  return (
    <ExampleTabs
      title="Checkbox"
      intro="A control that allows the user to toggle between checked and unchecked states."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
