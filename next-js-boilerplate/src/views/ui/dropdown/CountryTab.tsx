"use client";
import { useState } from "react";
import { Dropdown } from "@/components/ui/Dropdown";
import { Label } from "@/components/ui/Label";

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
      <Label htmlFor="country-dropdown">Country</Label>
      <Dropdown
        id="country-dropdown"
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
