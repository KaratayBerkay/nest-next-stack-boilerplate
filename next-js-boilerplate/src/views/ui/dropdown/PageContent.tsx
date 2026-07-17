"use client";
import { useState } from "react";
import { Dropdown } from "@/components/ui/Dropdown";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { VariantGallery } from "@/views/ui/_shared/VariantGallery";
import type { DropdownVariant } from "@/types/ui/Dropdown-types";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const COUNTRIES = [
  { value: "de", label: "Germany" },
  { value: "fr", label: "France" },
  { value: "nl", label: "Netherlands" },
  { value: "tr", label: "Türkiye" },
  { value: "gb", label: "United Kingdom" },
  { value: "us", label: "United States" },
];

function CountryTab() {
  const [country, setCountry] = useState<string | undefined>();

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="country-dropdown" className="text-sm font-medium text-fg">
        Country
      </label>
      <Dropdown
        aria-label="Country"
        options={COUNTRIES}
        value={country}
        onChange={setCountry}
        placeholder="Select a country"
        description="Used for shipping and invoices."
        className="max-w-sm"
      />
    </div>
  );
}

function SortByTab() {
  const [sort, setSort] = useState("newest");

  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted text-xs">
        Compact toolbar dropdown (size sm) for ordering a feed.
      </p>
      <div className="flex items-center gap-2">
        <span className="text-muted text-sm">Sort by</span>
        <Dropdown
          aria-label="Sort by"
          size="sm"
          options={[
            { value: "newest", label: "Newest first" },
            { value: "oldest", label: "Oldest first" },
            { value: "popular", label: "Most popular" },
            { value: "comments", label: "Most commented" },
          ]}
          value={sort}
          onChange={setSort}
          className="w-44"
        />
      </div>
    </div>
  );
}

function RowsPerPageTab() {
  const [perPage, setPerPage] = useState("25");

  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted text-xs">
        Table footer control: rows per page.
      </p>
      <div className="flex items-center gap-2">
        <Dropdown
          aria-label="Rows per page"
          size="sm"
          options={["10", "25", "50", "100"].map((n) => ({
            value: n,
            label: n,
          }))}
          value={perPage}
          onChange={setPerPage}
          className="w-20"
        />
        <span className="text-muted text-sm">rows per page</span>
      </div>
    </div>
  );
}

function PaymentMethodTab() {
  const [method, setMethod] = useState<string | undefined>();

  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted text-xs">
        Checkout payment method with a disabled (unavailable) option.
      </p>
      <Dropdown
        aria-label="Payment method"
        options={[
          { value: "card", label: "Credit / debit card" },
          { value: "bank", label: "Bank transfer" },
          { value: "paypal", label: "PayPal" },
          { value: "crypto", label: "Crypto (coming soon)", disabled: true },
        ]}
        value={method}
        onChange={setMethod}
        placeholder="Choose payment method"
        error={method ? undefined : "A payment method is required"}
        className="max-w-sm"
      />
    </div>
  );
}

const examples: UIExample[] = [
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

export default function DropdownPage({ initialTab }: { initialTab?: string }) {
  return (
    <ExampleTabs
      title="Dropdown"
      intro="An options-driven value picker with a fully themed list — trigger and panel share the app theme, unlike a native select."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
