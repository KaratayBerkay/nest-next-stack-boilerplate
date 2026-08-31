"use client";

import { useEffect, useState } from "react";
import {
  IconBuildingSkyscraper,
  IconCheck,
  IconDeviceFloppy,
  IconUpload,
} from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { NativeSelect } from "@/components/ui/NativeSelect";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { Switch } from "@/components/ui/Switch";
import { Textarea } from "@/components/ui/Textarea";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCrudCompaniesMessages } from "@/types/pages/crud-companies/CrudCompaniesMessages-types";

const INDUSTRY_OPTIONS = [
  "crudCompanies1IndustryOptionTech",
  "crudCompanies1IndustryOptionFinance",
  "crudCompanies1IndustryOptionHealthcare",
  "crudCompanies1IndustryOptionRetail",
  "crudCompanies1IndustryOptionManufacturing",
  "crudCompanies1IndustryOptionOther",
] as const;

const COUNTRY_OPTIONS = [
  "crudCompanies1CountryOptionUs",
  "crudCompanies1CountryOptionUk",
  "crudCompanies1CountryOptionDe",
  "crudCompanies1CountryOptionTr",
  "crudCompanies1CountryOptionOther",
] as const;

const SIZE_OPTIONS = [
  { value: "micro", labelKey: "crudCompanies1SizeOptionMicro" },
  { value: "small", labelKey: "crudCompanies1SizeOptionSmall" },
  { value: "medium", labelKey: "crudCompanies1SizeOptionMedium" },
  { value: "large", labelKey: "crudCompanies1SizeOptionLarge" },
] as const;

interface FormState {
  name: string;
  legalName: string;
  industry: string;
  website: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  size: string;
  active: boolean;
  notes: string;
}

const INITIAL_STATE: FormState = {
  name: "",
  legalName: "",
  industry: INDUSTRY_OPTIONS[0],
  website: "",
  email: "",
  phone: "",
  country: COUNTRY_OPTIONS[0],
  city: "",
  size: SIZE_OPTIONS[1].value,
  active: true,
  notes: "",
};

export function SectionedFormCrudCompanies() {
  const t = useMessages("pages") as unknown as PagesWithCrudCompaniesMessages;
  const c = t.crudCompanies;

  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [hasLogo, setHasLogo] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!saved) return;
    const timer = setTimeout(() => setSaved(false), 3000);
    return () => clearTimeout(timer);
  }, [saved]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <h2 className="text-3xl font-medium tracking-tighter md:text-4xl">
            {c.crudCompanies1Heading}
          </h2>
          <p className="text-muted text-base">{c.crudCompanies1Description}</p>
        </div>

        <form
          className="grid grid-cols-1 gap-6 lg:grid-cols-3"
          onSubmit={(event) => {
            event.preventDefault();
            setSaved(true);
          }}
        >
          <div className="flex flex-col gap-6 lg:col-span-2">
            <Card>
              <CardContent className="flex flex-col gap-5 pt-6">
                <h3 className="text-fg text-sm font-semibold tracking-wide uppercase">
                  {c.crudCompanies1SectionProfileTitle}
                </h3>
                <div className="flex items-center gap-4">
                  <Avatar
                    src={hasLogo ? "/img/placeholders/ph-1x1-3.webp" : undefined}
                    fallback={form.name || "CO"}
                    size="lg"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    leftIcon={<IconUpload size={14} />}
                    onClick={() => setHasLogo((prev) => !prev)}
                  >
                    {hasLogo
                      ? c.crudCompanies1LogoRemoveAria
                      : c.crudCompanies1LogoUploadAria}
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cc1-name">{c.crudCompanies1NameLabel}</Label>
                    <Input
                      id="cc1-name"
                      value={form.name}
                      placeholder={c.crudCompanies1NamePlaceholder}
                      onChange={(event) => update("name", event.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cc1-legal-name">
                      {c.crudCompanies1LegalNameLabel}
                    </Label>
                    <Input
                      id="cc1-legal-name"
                      value={form.legalName}
                      placeholder={c.crudCompanies1LegalNamePlaceholder}
                      onChange={(event) =>
                        update("legalName", event.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cc1-industry">
                    {c.crudCompanies1IndustryLabel}
                  </Label>
                  <NativeSelect
                    id="cc1-industry"
                    value={form.industry}
                    onChange={(event) => update("industry", event.target.value)}
                  >
                    {INDUSTRY_OPTIONS.map((key) => (
                      <option key={key} value={key}>
                        {c[key]}
                      </option>
                    ))}
                  </NativeSelect>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col gap-5 pt-6">
                <h3 className="text-fg text-sm font-semibold tracking-wide uppercase">
                  {c.crudCompanies1SectionContactTitle}
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cc1-website">
                      {c.crudCompanies1WebsiteLabel}
                    </Label>
                    <Input
                      id="cc1-website"
                      value={form.website}
                      placeholder={c.crudCompanies1WebsitePlaceholder}
                      onChange={(event) =>
                        update("website", event.target.value)
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cc1-email">
                      {c.crudCompanies1EmailLabel}
                    </Label>
                    <Input
                      id="cc1-email"
                      type="email"
                      value={form.email}
                      placeholder={c.crudCompanies1EmailPlaceholder}
                      onChange={(event) => update("email", event.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cc1-phone">
                      {c.crudCompanies1PhoneLabel}
                    </Label>
                    <Input
                      id="cc1-phone"
                      type="tel"
                      value={form.phone}
                      placeholder={c.crudCompanies1PhonePlaceholder}
                      onChange={(event) => update("phone", event.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col gap-5 pt-6">
                <h3 className="text-fg text-sm font-semibold tracking-wide uppercase">
                  {c.crudCompanies1SectionLocationTitle}
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cc1-country">
                      {c.crudCompanies1CountryLabel}
                    </Label>
                    <NativeSelect
                      id="cc1-country"
                      value={form.country}
                      onChange={(event) =>
                        update("country", event.target.value)
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
                    <Label htmlFor="cc1-city">{c.crudCompanies1CityLabel}</Label>
                    <Input
                      id="cc1-city"
                      value={form.city}
                      placeholder={c.crudCompanies1CityPlaceholder}
                      onChange={(event) => update("city", event.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-6">
            <Card>
              <CardContent className="flex flex-col gap-5 pt-6">
                <h3 className="text-fg text-sm font-semibold tracking-wide uppercase">
                  {c.crudCompanies1SectionPreferencesTitle}
                </h3>
                <div className="flex flex-col gap-2">
                  <Label>{c.crudCompanies1SizeLabel}</Label>
                  <RadioGroup
                    value={form.size}
                    onValueChange={(value) => update("size", value)}
                  >
                    {SIZE_OPTIONS.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center gap-2"
                      >
                        <RadioGroupItem
                          value={option.value}
                          id={`cc1-size-${option.value}`}
                        />
                        <Label
                          htmlFor={`cc1-size-${option.value}`}
                          className="cursor-pointer font-normal"
                        >
                          {c[option.labelKey]}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <div className="border-border flex items-center justify-between gap-4 border-t pt-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-fg text-sm font-medium">
                      {c.crudCompanies1ActiveLabel}
                    </span>
                    <span className="text-muted text-xs">
                      {c.crudCompanies1ActiveDescription}
                    </span>
                  </div>
                  <Switch
                    checked={form.active}
                    onChange={(event) =>
                      update("active", event.target.checked)
                    }
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cc1-notes">{c.crudCompanies1NotesLabel}</Label>
                  <Textarea
                    id="cc1-notes"
                    value={form.notes}
                    placeholder={c.crudCompanies1NotesPlaceholder}
                    onChange={(event) => update("notes", event.target.value)}
                    className="min-h-16"
                  />
                </div>
              </CardContent>
            </Card>

            <Card variant="surface">
              <CardContent className="flex flex-col gap-3 pt-6">
                <span className="text-muted text-xs font-medium tracking-wider uppercase">
                  {c.crudCompanies1PreviewTitle}
                </span>
                <div className="flex items-center gap-3">
                  <Avatar
                    src={hasLogo ? "/img/placeholders/ph-1x1-3.webp" : undefined}
                    fallback={form.name || "CO"}
                    size="md"
                  />
                  <div className="flex min-w-0 flex-col">
                    <span className="text-fg truncate text-sm font-semibold">
                      {form.name || c.crudCompanies1PreviewNameFallback}
                    </span>
                    <span className="text-muted truncate text-xs">
                      {form.city || c.crudCompanies1PreviewLocationFallback}
                    </span>
                  </div>
                </div>
                <Badge variant="soft" className="w-fit">
                  <IconBuildingSkyscraper size={12} className="mr-1" />
                  {form.industry
                    ? c[form.industry]
                    : c.crudCompanies1PreviewIndustryFallback}
                </Badge>
              </CardContent>
            </Card>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              leftIcon={
                saved ? <IconCheck size={16} /> : <IconDeviceFloppy size={16} />
              }
            >
              {saved
                ? c.crudCompanies1SavedMessage
                : c.crudCompanies1SaveButton}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
