import { CountryTab, COUNTRIES } from "./CountryTab";
import { SortByTab } from "./SortByTab";
import { RowsPerPageTab } from "./RowsPerPageTab";
import { PaymentMethodTab } from "./PaymentMethodTab";
import { VariantGallery } from "@/views/ui/_shared/VariantGallery";
import { Dropdown } from "@/components/ui/Dropdown";
import type { DropdownVariant } from "@/types/ui/Dropdown-types";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

export const examples: UIExample[] = [
  {
    id: "default",
    title: "Country",
    description: "Form field dropdown with placeholder and description.",
    render: () => <CountryTab />,
  },
  {
    id: "sort-by",
    title: "Sort By",
    description: "Compact toolbar dropdown for list ordering.",
    render: () => <SortByTab />,
  },
  {
    id: "rows-per-page",
    title: "Rows Per Page",
    description: "Small numeric dropdown for pagination page size.",
    render: () => <RowsPerPageTab />,
  },
  {
    id: "payment-method",
    title: "Payment Method",
    description: "Required field with error state and a disabled option.",
    render: () => <PaymentMethodTab />,
  },
  {
    id: "variant-gallery",
    title: "Variant Gallery",
    description: "All variants and sizes.",
    render: () => (
      <VariantGallery
        variants={["default", "outline", "shiny", "glass", "neon", "gradient"]}
        sizes={["sm", "md"]}
        render={(variant, size) => (
          <Dropdown
            variant={variant as DropdownVariant}
            size={size === "sm" ? "sm" : "md"}
            options={COUNTRIES}
            placeholder="Select a country"
            className="w-44"
          />
        )}
      />
    ),
  },
];
