"use client";
import { useState } from "react";
import { Dropdown } from "@/components/ui/Dropdown";

export const COUNTRIES = [
  { value: "de", label: "Germany" },
  { value: "fr", label: "France" },
  { value: "nl", label: "Netherlands" },
  { value: "tr", label: "Türkiye" },
  { value: "gb", label: "United Kingdom" },
  { value: "us", label: "United States" },
];

export function CountryTab() {
  const [country, setCountry] = useState<string | undefined>();

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="country-dropdown" className="text-fg text-sm font-medium">
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
