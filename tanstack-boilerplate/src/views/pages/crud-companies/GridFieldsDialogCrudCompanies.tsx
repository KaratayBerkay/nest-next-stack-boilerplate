"use client";

import { useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { NativeSelect } from "@/components/ui/NativeSelect";
import { Textarea } from "@/components/ui/Textarea";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCrudCompaniesMessages } from "@/types/pages/crud-companies/CrudCompaniesMessages-types";

const INDUSTRY_OPTIONS = [
  "crudCompanies5IndustryOption1",
  "crudCompanies5IndustryOption2",
  "crudCompanies5IndustryOption3",
  "crudCompanies5IndustryOption4",
] as const;

const SIZE_OPTIONS = [
  "crudCompanies5SizeOption1",
  "crudCompanies5SizeOption2",
  "crudCompanies5SizeOption3",
  "crudCompanies5SizeOption4",
] as const;

const COUNTRY_OPTIONS = [
  "crudCompanies5CountryOption1",
  "crudCompanies5CountryOption2",
  "crudCompanies5CountryOption3",
  "crudCompanies5CountryOption4",
] as const;

const EXISTING_CHIP_KEYS = [
  "crudCompanies5Chip1",
  "crudCompanies5Chip2",
  "crudCompanies5Chip3",
  "crudCompanies5Chip4",
  "crudCompanies5Chip5",
] as const;

const EMPTY_DRAFT = {
  name: "",
  legalName: "",
  industry: INDUSTRY_OPTIONS[0] as string,
  size: SIZE_OPTIONS[0] as string,
  website: "",
  email: "",
  phone: "",
  taxId: "",
  country: COUNTRY_OPTIONS[0] as string,
  city: "",
  postalCode: "",
  foundedYear: "",
  description: "",
};

export function GridFieldsDialogCrudCompanies() {
  const t = useMessages("pages") as unknown as PagesWithCrudCompaniesMessages;
  const c = t.crudCompanies;

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [extraChips, setExtraChips] = useState<string[]>([]);

  function field<K extends keyof typeof EMPTY_DRAFT>(key: K, value: string) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.name.trim()) return;
    setExtraChips((prev) => [...prev, draft.name]);
    setDraft(EMPTY_DRAFT);
    setOpen(false);
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 px-6 text-center lg:px-8">
        <div className="flex flex-col gap-3">
          <h2 className="text-3xl font-medium tracking-tighter md:text-4xl">
            {c.crudCompanies5Heading}
          </h2>
          <p className="text-muted text-base">{c.crudCompanies5Description}</p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <span className="text-muted text-xs font-medium tracking-wider uppercase">
            {c.crudCompanies5ExistingLabel}
          </span>
          <div className="flex flex-wrap justify-center gap-2">
            {EXISTING_CHIP_KEYS.map((key) => (
              <Badge key={key} variant="secondary">
                {c[key]}
              </Badge>
            ))}
            {extraChips.map((name, index) => (
              <Badge key={`${name}-${index}`} variant="soft">
                {name}
              </Badge>
            ))}
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger variant="primary">
            <IconPlus size={16} className="mr-1.5" />
            {c.crudCompanies5OpenButton}
          </DialogTrigger>
          <DialogContent size="lg">
            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
              <DialogHeader>
                <DialogTitle>{c.crudCompanies5DialogTitle}</DialogTitle>
                <DialogDescription>
                  {c.crudCompanies5DialogDescription}
                </DialogDescription>
              </DialogHeader>
              <DialogBody>
                <div className="grid grid-cols-1 gap-4 text-left sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cc5-name">
                      {c.crudCompanies5NameLabel}
                    </Label>
                    <Input
                      id="cc5-name"
                      value={draft.name}
                      placeholder={c.crudCompanies5NamePlaceholder}
                      onChange={(event) => field("name", event.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cc5-legal-name">
                      {c.crudCompanies5LegalNameLabel}
                    </Label>
                    <Input
                      id="cc5-legal-name"
                      value={draft.legalName}
                      placeholder={c.crudCompanies5LegalNamePlaceholder}
                      onChange={(event) =>
                        field("legalName", event.target.value)
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cc5-industry">
                      {c.crudCompanies5IndustryLabel}
                    </Label>
                    <NativeSelect
                      id="cc5-industry"
                      value={draft.industry}
                      onChange={(event) =>
                        field("industry", event.target.value)
                      }
                    >
                      {INDUSTRY_OPTIONS.map((key) => (
                        <option key={key} value={key}>
                          {c[key]}
                        </option>
                      ))}
                    </NativeSelect>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cc5-size">{c.crudCompanies5SizeLabel}</Label>
                    <NativeSelect
                      id="cc5-size"
                      value={draft.size}
                      onChange={(event) => field("size", event.target.value)}
                    >
                      {SIZE_OPTIONS.map((key) => (
                        <option key={key} value={key}>
                          {c[key]}
                        </option>
                      ))}
                    </NativeSelect>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cc5-website">
                      {c.crudCompanies5WebsiteLabel}
                    </Label>
                    <Input
                      id="cc5-website"
                      value={draft.website}
                      placeholder={c.crudCompanies5WebsitePlaceholder}
                      onChange={(event) =>
                        field("website", event.target.value)
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cc5-email">
                      {c.crudCompanies5EmailLabel}
                    </Label>
                    <Input
                      id="cc5-email"
                      type="email"
                      value={draft.email}
                      placeholder={c.crudCompanies5EmailPlaceholder}
                      onChange={(event) => field("email", event.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cc5-phone">
                      {c.crudCompanies5PhoneLabel}
                    </Label>
                    <Input
                      id="cc5-phone"
                      type="tel"
                      value={draft.phone}
                      placeholder={c.crudCompanies5PhonePlaceholder}
                      onChange={(event) => field("phone", event.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cc5-tax-id">
                      {c.crudCompanies5TaxIdLabel}
                    </Label>
                    <Input
                      id="cc5-tax-id"
                      value={draft.taxId}
                      placeholder={c.crudCompanies5TaxIdPlaceholder}
                      onChange={(event) => field("taxId", event.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cc5-country">
                      {c.crudCompanies5CountryLabel}
                    </Label>
                    <NativeSelect
                      id="cc5-country"
                      value={draft.country}
                      onChange={(event) =>
                        field("country", event.target.value)
                      }
                    >
                      {COUNTRY_OPTIONS.map((key) => (
                        <option key={key} value={key}>
                          {c[key]}
                        </option>
                      ))}
                    </NativeSelect>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cc5-city">{c.crudCompanies5CityLabel}</Label>
                    <Input
                      id="cc5-city"
                      value={draft.city}
                      placeholder={c.crudCompanies5CityPlaceholder}
                      onChange={(event) => field("city", event.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cc5-postal-code">
                      {c.crudCompanies5PostalCodeLabel}
                    </Label>
                    <Input
                      id="cc5-postal-code"
                      value={draft.postalCode}
                      placeholder={c.crudCompanies5PostalCodePlaceholder}
                      onChange={(event) =>
                        field("postalCode", event.target.value)
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cc5-founded-year">
                      {c.crudCompanies5FoundedYearLabel}
                    </Label>
                    <Input
                      id="cc5-founded-year"
                      type="number"
                      value={draft.foundedYear}
                      placeholder={c.crudCompanies5FoundedYearPlaceholder}
                      onChange={(event) =>
                        field("foundedYear", event.target.value)
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label htmlFor="cc5-description">
                      {c.crudCompanies5DescriptionLabel}
                    </Label>
                    <Textarea
                      id="cc5-description"
                      value={draft.description}
                      placeholder={c.crudCompanies5DescriptionPlaceholder}
                      onChange={(event) =>
                        field("description", event.target.value)
                      }
                    />
                  </div>
                </div>
              </DialogBody>
              <DialogFooter>
                <DialogClose type="button">
                  {c.crudCompanies5CancelButton}
                </DialogClose>
                <Button type="submit" variant="primary">
                  {c.crudCompanies5SubmitButton}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
