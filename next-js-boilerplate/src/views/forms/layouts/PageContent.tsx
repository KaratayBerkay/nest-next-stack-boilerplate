"use client";

import { useAppForm } from "@/features/forms/form-hook";
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

function LayoutCard({ label, description, children }: LayoutCardProps) {
  return (
    <div className="surface border-border flex flex-col gap-4 rounded-lg border p-5">
      <div>
        <p className="text-xs font-semibold">{label}</p>
        {description && <p className="text-muted text-xs">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function ContactForm() {
  const form = useAppForm({
    ...basicFormOpts,
  });

  return (
    <LayoutCard
      label="Contact Form"
      description="Basic single-column form with name, email, subject, and message"
    >
      <form.AppForm>
        <form className="flex flex-col gap-3">
          <form.AppField
            name="fullName"
            validators={{ onChange: contactFieldSchemas.fullName }}
          >
            {(field) => (
              <field.TextField label="Full Name" placeholder="John Doe" />
            )}
          </form.AppField>
          <form.AppField
            name="email"
            validators={{ onChange: contactFieldSchemas.email }}
          >
            {(field) => (
              <field.TextField label="Email" placeholder="john@example.com" />
            )}
          </form.AppField>
          <div className="flex flex-col gap-1">
            <Label>Subject</Label>
            <NativeSelect
              value={form.getFieldValue("subject")}
              onChange={(e) => form.setFieldValue("subject", e.target.value)}
            >
              <option value="">Select Subject</option>
              <option value="general">General Inquiry</option>
              <option value="support">Support</option>
              <option value="feedback">Feedback</option>
              <option value="other">Other</option>
            </NativeSelect>
          </div>
          <form.AppField
            name="message"
            validators={{ onChange: contactFieldSchemas.message }}
          >
            {(field) => <field.TextareaField label="Message" />}
          </form.AppField>
          <form.SubmitButton label="Submit" />
        </form>
      </form.AppForm>
    </LayoutCard>
  );
}

function TwoColumnGridForm() {
  const form = useAppForm({
    ...twoColumnFormOpts,
  });

  return (
    <LayoutCard
      label="Two-Column Grid Form"
      description="Side-by-side name fields with full-width email, subject, and message"
    >
      <form.AppForm>
        <form className="flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <form.AppField
              name="firstName"
              validators={{ onChange: twoColumnFieldSchemas.firstName }}
            >
              {(field) => (
                <field.TextField label="First Name" placeholder="John" />
              )}
            </form.AppField>
            <form.AppField
              name="lastName"
              validators={{ onChange: twoColumnFieldSchemas.lastName }}
            >
              {(field) => (
                <field.TextField label="Last Name" placeholder="Doe" />
              )}
            </form.AppField>
          </div>
          <form.AppField
            name="email"
            validators={{ onChange: twoColumnFieldSchemas.email }}
          >
            {(field) => (
              <field.TextField label="Email" placeholder="john@example.com" />
            )}
          </form.AppField>
          <div className="flex flex-col gap-1">
            <Label>Select Subject</Label>
            <NativeSelect
              value={form.getFieldValue("subject")}
              onChange={(e) => form.setFieldValue("subject", e.target.value)}
            >
              <option value="">Choose an option</option>
              <option value="option1">Option 1</option>
              <option value="option2">Option 2</option>
              <option value="option3">Option 3</option>
              <option value="option4">Option 4</option>
            </NativeSelect>
          </div>
          <form.AppField
            name="message"
            validators={{ onChange: twoColumnFieldSchemas.message }}
          >
            {(field) => <field.TextareaField label="Message" maxLength={200} />}
          </form.AppField>
          <form.SubmitButton label="Send Message" />
        </form>
      </form.AppForm>
    </LayoutCard>
  );
}

function IconPrefixedForm() {
  const form = useAppForm({
    ...iconFormOpts,
  });

  return (
    <LayoutCard
      label="Icon-Prefixed Inputs"
      description="Inputs with leading SVG icons and a remember-me checkbox"
    >
      <form.AppForm>
        <form className="flex flex-col gap-3">
          <form.AppField
            name="name"
            validators={{ onChange: iconFieldSchemas.name }}
          >
            {(field) => (
              <div className="flex flex-col gap-1">
                <Label htmlFor={field.name}>Name</Label>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Your name"
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
                <Label htmlFor={field.name}>Email</Label>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="your@email.com"
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
                <Label htmlFor={field.name}>Password</Label>
                <Input
                  id={field.name}
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="••••••••"
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
                <Label htmlFor={field.name}>Remember me</Label>
              </div>
            )}
          </form.AppField>
          <form.SubmitButton label="Create Account" />
        </form>
      </form.AppForm>
    </LayoutCard>
  );
}

function SectionedCardForm() {
  const form = useAppForm({
    ...sectionedFormOpts,
  });

  return (
    <LayoutCard
      label="Sectioned Card Form"
      description="Multiple card sections for complex data entry"
    >
      <form.AppForm>
        <form className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <p className="text-xxs text-muted tracking-wider uppercase">
              Personal Info
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <form.AppField
                name="firstName"
                validators={{ onChange: sectionedFieldSchemas.firstName }}
              >
                {(field) => <field.TextField label="First Name" />}
              </form.AppField>
              <form.AppField
                name="lastName"
                validators={{ onChange: sectionedFieldSchemas.lastName }}
              >
                {(field) => <field.TextField label="Last Name" />}
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
              <Label>Gender</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" name="gender" className="accent-brand" />
                  Male
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="gender"
                    defaultChecked
                    className="accent-brand"
                  />
                  Female
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" name="gender" className="accent-brand" />
                  Other
                </label>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Label>Category</Label>
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
            <p className="text-xxs text-muted tracking-wider uppercase">
              Address
            </p>
            <form.AppField
              name="street"
              validators={{ onChange: sectionedFieldSchemas.street }}
            >
              {(field) => <field.TextField label="Street" />}
            </form.AppField>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <form.AppField
                name="city"
                validators={{ onChange: sectionedFieldSchemas.city }}
              >
                {(field) => <field.TextField label="City" />}
              </form.AppField>
              <form.AppField
                name="state"
                validators={{ onChange: sectionedFieldSchemas.state }}
              >
                {(field) => <field.TextField label="State" />}
              </form.AppField>
              <form.AppField
                name="zip"
                validators={{ onChange: sectionedFieldSchemas.zip }}
              >
                {(field) => <field.TextField label="Post Code" />}
              </form.AppField>
            </div>
            <div className="flex flex-col gap-1">
              <Label>Country</Label>
              <NativeSelect
                value={form.getFieldValue("country")}
                onChange={(e) => form.setFieldValue("country", e.target.value)}
              >
                <option value="">-- Select Country --</option>
                <option value="us">USA</option>
                <option value="ca">Canada</option>
                <option value="uk">United Kingdom</option>
                <option value="tr">Turkey</option>
              </NativeSelect>
            </div>
          </div>

          <div className="border-border border-t" />

          <div className="flex flex-col gap-3">
            <p className="text-xxs text-muted tracking-wider uppercase">
              Membership
            </p>
            <div className="flex flex-col gap-2">
              <Label>Plan</Label>
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
              <Label>I agree to the terms and conditions</Label>
            </div>
          </div>

          <div className="flex gap-3">
            <form.SubmitButton label="Save Changes" />
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </div>
        </form>
      </form.AppForm>
    </LayoutCard>
  );
}

export default function FormLayoutsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-semibold">Form Layouts</h2>
        <p className="text-muted text-xs">
          Basic stacked, two-column grid, icon-prefixed, and sectioned card form
          patterns.
        </p>
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
