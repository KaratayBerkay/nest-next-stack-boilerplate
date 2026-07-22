"use client";

import { useMessages } from "@/lib/i18n/MessagesProvider";
import { FieldInfoButton } from "@/components/ui/FieldInfoButton";
import { useStore } from "@tanstack/react-form";
import { useAppForm } from "@/features/forms/form-hook";
import { createFormSubmitHandler } from "@/lib/forms/shared";
import {
  basicFormOpts,
  twoColumnFormOpts,
  iconFormOpts,
  sectionedFormOpts,
} from "@/validators/forms/layouts-inits";
import {
  contactFieldSchemas,
  twoColumnFieldSchemas,
  iconFieldSchemas,
  sectionedFieldSchemas,
} from "@/validators/forms/layouts-validation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { NativeSelect } from "@/components/ui/NativeSelect";
import { Checkbox } from "@/components/ui/Checkbox";
import { Label } from "@/components/ui/Label";
import type { LayoutCardProps } from "@/types/forms/LayoutCard-types";

function LayoutCard({
  label,
  description,
  fullWidth,
  children,
}: LayoutCardProps) {
  return (
    <div
      className={`surface border-border flex flex-col gap-4 rounded-lg border p-5 shadow-xs ${
        fullWidth ? "max-w-4xl" : "max-w-2xl"
      }`}
    >
      <div>
        <p className="text-xs font-semibold">{label}</p>
        {description && <p className="text-muted text-xs">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function ContactForm() {
  const t = useMessages("forms");
  const form = useAppForm({
    ...basicFormOpts,
  });
  const isDirty = useStore(form.store, (s) => s.isDirty);
  const onSubmit = createFormSubmitHandler(form);

  return (
    <LayoutCard
      label={t.layouts.contact_label}
      description={t.layouts.contact_description}
    >
      <form.AppForm>
        <form className="flex flex-col gap-3" onSubmit={onSubmit}>
          <form.AppField
            name="fullName"
            validators={{ onChange: contactFieldSchemas.fullName }}
          >
            {(field) => (
              <div className="flex items-center gap-1">
                <field.TextField
                  label={t.layouts.contactFullName_label}
                  placeholder={t.layouts.contactFullName_placeholder}
                />
                <FieldInfoButton description={t.layouts.contactFullName_info} />
              </div>
            )}
          </form.AppField>
          <form.AppField
            name="email"
            validators={{ onChange: contactFieldSchemas.email }}
          >
            {(field) => (
              <div className="flex items-center gap-1">
                <field.TextField
                  label={t.layouts.contactEmail_label}
                  placeholder={t.layouts.contactEmail_placeholder}
                />
                <FieldInfoButton description={t.layouts.contactEmail_info} />
              </div>
            )}
          </form.AppField>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <Label>{t.layouts.contactSubject_label}</Label>
              <FieldInfoButton description={t.layouts.contactSubject_info} />
            </div>
            <NativeSelect
              value={form.getFieldValue("subject")}
              onChange={(e) => form.setFieldValue("subject", e.target.value)}
            >
              <option value="">{t.layouts.contactSubject_placeholder}</option>
              <option value="general">
                {t.layouts.contactSubject_general}
              </option>
              <option value="support">
                {t.layouts.contactSubject_support}
              </option>
              <option value="feedback">
                {t.layouts.contactSubject_feedback}
              </option>
              <option value="other">{t.layouts.contactSubject_other}</option>
            </NativeSelect>
          </div>
          <form.AppField
            name="message"
            validators={{ onChange: contactFieldSchemas.message }}
          >
            {(field) => (
              <div className="flex items-center gap-1">
                <field.TextareaField label={t.layouts.contactMessage_label} />
                <FieldInfoButton description={t.layouts.contactMessage_info} />
              </div>
            )}
          </form.AppField>
          <div className="flex items-center justify-between">
            <form.SubmitButton
              label={t.layouts.contactSubmit}
              loadingLabel={t.layouts.contactSubmitting}
            />
            {isDirty && (
              <span className="text-warning text-xxs flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                Unsaved changes
              </span>
            )}
          </div>
        </form>
      </form.AppForm>
    </LayoutCard>
  );
}

function TwoColumnGridForm() {
  const t = useMessages("forms");
  const form = useAppForm({
    ...twoColumnFormOpts,
  });
  const isDirty = useStore(form.store, (s) => s.isDirty);
  const onSubmit = createFormSubmitHandler(form);

  return (
    <LayoutCard
      label={t.layouts.twoColumn_label}
      description={t.layouts.twoColumn_description}
    >
      <form.AppForm>
        <form className="flex flex-col gap-3" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <form.AppField
              name="firstName"
              validators={{ onChange: twoColumnFieldSchemas.firstName }}
            >
              {(field) => (
                <div className="flex items-center gap-1">
                  <field.TextField
                    label={t.layouts.twoColumnFirstName_label}
                    placeholder={t.layouts.twoColumnFirstName_placeholder}
                  />
                  <FieldInfoButton
                    description={t.layouts.twoColumnFirstName_info}
                  />
                </div>
              )}
            </form.AppField>
            <form.AppField
              name="lastName"
              validators={{ onChange: twoColumnFieldSchemas.lastName }}
            >
              {(field) => (
                <div className="flex items-center gap-1">
                  <field.TextField
                    label={t.layouts.twoColumnLastName_label}
                    placeholder={t.layouts.twoColumnLastName_placeholder}
                  />
                  <FieldInfoButton
                    description={t.layouts.twoColumnLastName_info}
                  />
                </div>
              )}
            </form.AppField>
          </div>
          <form.AppField
            name="email"
            validators={{ onChange: twoColumnFieldSchemas.email }}
          >
            {(field) => (
              <div className="flex items-center gap-1">
                <field.TextField
                  label={t.layouts.contactEmail_label}
                  placeholder={t.layouts.contactEmail_placeholder}
                />
                <FieldInfoButton description={t.layouts.contactEmail_info} />
              </div>
            )}
          </form.AppField>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <Label>{t.layouts.twoColumnSubject_label}</Label>
              <FieldInfoButton description={t.layouts.twoColumnSubject_info} />
            </div>
            <NativeSelect
              value={form.getFieldValue("subject")}
              onChange={(e) => form.setFieldValue("subject", e.target.value)}
            >
              <option value="">{t.layouts.twoColumnSubject_placeholder}</option>
              <option value="option1">
                {t.layouts.twoColumnSubject_option1}
              </option>
              <option value="option2">
                {t.layouts.twoColumnSubject_option2}
              </option>
              <option value="option3">
                {t.layouts.twoColumnSubject_option3}
              </option>
              <option value="option4">
                {t.layouts.twoColumnSubject_option4}
              </option>
            </NativeSelect>
          </div>
          <form.AppField
            name="message"
            validators={{ onChange: twoColumnFieldSchemas.message }}
          >
            {(field) => (
              <div className="flex items-center gap-1">
                <field.TextareaField
                  label={t.layouts.twoColumnMessage_label}
                  maxLength={200}
                />
                <FieldInfoButton
                  description={t.layouts.twoColumnMessage_info}
                />
              </div>
            )}
          </form.AppField>
          <div className="flex items-center justify-between">
            <form.SubmitButton
              label={t.layouts.twoColumnSubmit}
              loadingLabel={t.layouts.twoColumnSubmitting}
            />
            {isDirty && (
              <span className="text-warning text-xxs flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                Unsaved changes
              </span>
            )}
          </div>
        </form>
      </form.AppForm>
    </LayoutCard>
  );
}

function IconPrefixedForm() {
  const t = useMessages("forms");
  const form = useAppForm({
    ...iconFormOpts,
  });
  const isDirty = useStore(form.store, (s) => s.isDirty);
  const onSubmit = createFormSubmitHandler(form);

  return (
    <LayoutCard
      label={t.layouts.icon_label}
      description={t.layouts.icon_description}
    >
      <form.AppForm>
        <form className="flex flex-col gap-3" onSubmit={onSubmit}>
          <form.AppField
            name="name"
            validators={{ onChange: iconFieldSchemas.name }}
          >
            {(field) => (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <Label htmlFor={field.name}>{t.layouts.iconName_label}</Label>
                  <FieldInfoButton description={t.layouts.iconName_info} />
                </div>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={t.layouts.iconName_placeholder}
                  leftIcon={
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  }
                />
              </div>
            )}
          </form.AppField>
          <form.AppField
            name="mail"
            validators={{ onChange: iconFieldSchemas.mail }}
          >
            {(field) => (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <Label htmlFor={field.name}>
                    {t.layouts.iconEmail_label}
                  </Label>
                  <FieldInfoButton description={t.layouts.iconEmail_info} />
                </div>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={t.layouts.iconEmail_placeholder}
                  leftIcon={
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  }
                />
              </div>
            )}
          </form.AppField>
          <form.AppField
            name="lock"
            validators={{ onChange: iconFieldSchemas.lock }}
          >
            {(field) => (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <Label htmlFor={field.name}>
                    {t.layouts.iconPassword_label}
                  </Label>
                  <FieldInfoButton description={t.layouts.iconPassword_info} />
                </div>
                <Input
                  id={field.name}
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={t.layouts.iconPassword_placeholder}
                  leftIcon={
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  }
                />
              </div>
            )}
          </form.AppField>
          <form.AppField name="rememberMe">
            {(field) => (
              <div className="flex items-center gap-2 text-sm">
                <Checkbox
                  id={field.name}
                  checked={field.state.value}
                  onChange={(e) => field.handleChange(e.target.checked)}
                />
                <div className="flex items-center gap-2 text-sm">
                  <Checkbox
                    id={field.name}
                    checked={field.state.value}
                    onChange={(e) => field.handleChange(e.target.checked)}
                  />
                  <Label htmlFor={field.name}>
                    {t.layouts.iconRemember_label}
                  </Label>
                  <FieldInfoButton description={t.layouts.iconRemember_info} />
                </div>
              </div>
            )}
          </form.AppField>
          <div className="flex items-center justify-between">
            <form.SubmitButton label={t.layouts.iconSubmit} />
            {isDirty && (
              <span className="text-warning text-xxs flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                Unsaved changes
              </span>
            )}
          </div>
        </form>
      </form.AppForm>
    </LayoutCard>
  );
}

function SectionedCardForm() {
  const t = useMessages("forms");
  const form = useAppForm({
    ...sectionedFormOpts,
  });
  const isDirty = useStore(form.store, (s) => s.isDirty);
  const onSubmit = createFormSubmitHandler(form);

  return (
    <LayoutCard
      label={t.layouts.sectioned_label}
      description={t.layouts.sectioned_description}
      fullWidth
    >
      <form.AppForm>
        <form className="flex flex-col gap-6" onSubmit={onSubmit}>
          <div className="flex flex-col gap-3">
            <p className="text-xxs text-muted border-brand border-l-2 pl-3 tracking-wider uppercase">
              Personal Info
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <form.AppField
                name="firstName"
                validators={{ onChange: sectionedFieldSchemas.firstName }}
              >
                {(field) => (
                  <div className="flex items-center gap-1">
                    <field.TextField
                      label={t.layouts.sectionedFirstName_label}
                      placeholder={t.layouts.sectionedFirstName_placeholder}
                    />
                    <FieldInfoButton
                      description={t.layouts.sectionedFirstName_info}
                    />
                  </div>
                )}
              </form.AppField>
              <form.AppField
                name="lastName"
                validators={{ onChange: sectionedFieldSchemas.lastName }}
              >
                {(field) => (
                  <div className="flex items-center gap-1">
                    <field.TextField
                      label={t.layouts.sectionedLastName_label}
                      placeholder={t.layouts.sectionedLastName_placeholder}
                    />
                    <FieldInfoButton
                      description={t.layouts.sectionedLastName_info}
                    />
                  </div>
                )}
              </form.AppField>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <form.AppField
                name="email"
                validators={{ onChange: sectionedFieldSchemas.email }}
              >
                {(field) => <field.TextField label="Email" />}
              </form.AppField>
              <div className="flex flex-col gap-1">
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  value={form.getFieldValue("dateOfBirth")}
                  onChange={(e) =>
                    form.setFieldValue("dateOfBirth", e.target.value)
                  }
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <Label>{t.layouts.sectionedGender_label}</Label>
                <FieldInfoButton description={t.layouts.sectionedGender_info} />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" name="gender" className="accent-brand" />
                  {t.layouts.sectionedGender_male}
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="gender"
                    defaultChecked
                    className="accent-brand"
                  />
                  {t.layouts.sectionedGender_female}
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" name="gender" className="accent-brand" />
                  {t.layouts.sectionedGender_other}
                </label>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <Label>{t.layouts.sectionedCategory_label}</Label>
                <FieldInfoButton
                  description={t.layouts.sectionedCategory_info}
                />
              </div>
              <div className="flex gap-4">
                {[
                  { value: "tech" as const, label: "Technology" },
                  { value: "design" as const, label: "Design" },
                  { value: "business" as const, label: "Business" },
                ].map((c) => (
                  <label
                    key={c.value}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="radio"
                      name="category"
                      value={c.value}
                      className="accent-brand"
                      checked={form.getFieldValue("category") === c.value}
                      onChange={() => form.setFieldValue("category", c.value)}
                    />
                    {c.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="border-border border-t" />

          <div className="flex flex-col gap-3">
            <p className="text-xxs text-muted border-brand border-l-2 pl-3 tracking-wider uppercase">
              Address
            </p>
            <form.AppField
              name="street"
              validators={{ onChange: sectionedFieldSchemas.street }}
            >
              {(field) => (
                <div className="flex items-center gap-1">
                  <field.TextField
                    label={t.layouts.sectionedStreet_label}
                    placeholder={t.layouts.sectionedStreet_placeholder}
                  />
                  <FieldInfoButton
                    description={t.layouts.sectionedStreet_info}
                  />
                </div>
              )}
            </form.AppField>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <form.AppField
                name="city"
                validators={{ onChange: sectionedFieldSchemas.city }}
              >
                {(field) => (
                  <div className="flex items-center gap-1">
                    <field.TextField
                      label={t.layouts.sectionedCity_label}
                      placeholder={t.layouts.sectionedCity_placeholder}
                    />
                    <FieldInfoButton
                      description={t.layouts.sectionedCity_info}
                    />
                  </div>
                )}
              </form.AppField>
              <form.AppField
                name="state"
                validators={{ onChange: sectionedFieldSchemas.state }}
              >
                {(field) => (
                  <div className="flex items-center gap-1">
                    <field.TextField
                      label={t.layouts.sectionedState_label}
                      placeholder={t.layouts.sectionedState_placeholder}
                    />
                    <FieldInfoButton
                      description={t.layouts.sectionedState_info}
                    />
                  </div>
                )}
              </form.AppField>
              <form.AppField
                name="zip"
                validators={{ onChange: sectionedFieldSchemas.zip }}
              >
                {(field) => (
                  <div className="flex items-center gap-1">
                    <field.TextField
                      label={t.layouts.sectionedZip_label}
                      placeholder={t.layouts.sectionedZip_placeholder}
                    />
                    <FieldInfoButton
                      description={t.layouts.sectionedZip_info}
                    />
                  </div>
                )}
              </form.AppField>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <Label>{t.layouts.sectionedCountry_label}</Label>
                <FieldInfoButton
                  description={t.layouts.sectionedCountry_info}
                />
              </div>
              <NativeSelect
                value={form.getFieldValue("country")}
                onChange={(e) => form.setFieldValue("country", e.target.value)}
              >
                <option value="">
                  {t.layouts.sectionedCountry_placeholder}
                </option>
                <option value="us">{t.layouts.sectionedCountry_us}</option>
                <option value="ca">{t.layouts.sectionedCountry_ca}</option>
                <option value="uk">{t.layouts.sectionedCountry_uk}</option>
                <option value="tr">{t.layouts.sectionedCountry_tr}</option>
              </NativeSelect>
            </div>
          </div>

          <div className="border-border border-t" />

          <div className="flex flex-col gap-3">
            <p className="text-xxs text-muted border-brand border-l-2 pl-3 tracking-wider uppercase">
              Membership
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1">
                <Label>{t.layouts.sectionedPlan_label}</Label>
                <FieldInfoButton description={t.layouts.sectionedPlan_info} />
              </div>
              <div className="flex gap-4">
                {[
                  { value: "free" as const, label: "Free" },
                  { value: "basic" as const, label: "Basic" },
                  { value: "premium" as const, label: "Premium" },
                ].map((p) => (
                  <label
                    key={p.value}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="radio"
                      name="plan"
                      value={p.value}
                      className="accent-brand"
                      checked={form.getFieldValue("plan") === p.value}
                      onChange={() => form.setFieldValue("plan", p.value)}
                    />
                    {p.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Switch
                checked={form.getFieldValue("agree")}
                onChange={() =>
                  form.setFieldValue("agree", !form.getFieldValue("agree"))
                }
              />
              <div className="flex items-center gap-1">
                <Label>{t.layouts.sectionedAgree_label}</Label>
                <FieldInfoButton description={t.layouts.sectionedAgree_info} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <form.SubmitButton label={t.layouts.sectionedSubmit} />
              <Button type="button" variant="outline">
                {t.layouts.sectionedCancel}
              </Button>
            </div>
            {isDirty && (
              <span className="text-warning text-xxs flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                Unsaved changes
              </span>
            )}
          </div>
        </form>
      </form.AppForm>
    </LayoutCard>
  );
}

export default function FormLayoutsPage() {
  const t = useMessages("forms");
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-semibold">{t.layouts.heading}</h2>
        <p className="text-muted text-xs">{t.layouts.description}</p>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ContactForm />
        <TwoColumnGridForm />
        <IconPrefixedForm />
      </div>
      <SectionedCardForm />
    </div>
  );
}
