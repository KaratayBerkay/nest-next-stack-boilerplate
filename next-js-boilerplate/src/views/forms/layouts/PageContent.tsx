"use client";

import { useMemo } from "react";
import { z } from "zod";
import { useAppForm } from "@/features/forms/form-hook";
import {
  basicFormOpts,
  twoColumnFormOpts,
  iconFormOpts,
  sectionedFormOpts,
} from "@/validators/forms/layouts-inits";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { NativeSelect } from "@/components/ui/NativeSelect";
import { Label } from "@/components/ui/Label";

function LayoutCard({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
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

function BasicStackedForm() {
  const fieldSchemas = useMemo(
    () => ({
      fullName: z.string().min(2, "Name must be at least 2 characters"),
      email: z.string().email("Invalid email address"),
      password: z.string().min(6, "Password must be at least 6 characters"),
    }),
    [],
  );
  const form = useAppForm({
    ...basicFormOpts,
  });

  return (
    <LayoutCard
      label="Basic Stacked Form"
      description="Simple single-column form with full-width inputs"
    >
      <form.AppForm>
        <form className="flex flex-col gap-3">
          <form.AppField
            name="fullName"
            validators={{ onChange: fieldSchemas.fullName }}
          >
            {(field) => (
              <field.TextField label="Full Name" placeholder="John Doe" />
            )}
          </form.AppField>
          <form.AppField
            name="email"
            validators={{ onChange: fieldSchemas.email }}
          >
            {(field) => (
              <field.TextField label="Email" placeholder="john@example.com" />
            )}
          </form.AppField>
          <form.AppField
            name="password"
            validators={{ onChange: fieldSchemas.password }}
          >
            {(field) => (
              <field.TextField
                label="Password"
                type="password"
                showPasswordToggle
              />
            )}
          </form.AppField>
          <form.AppField name="confirmPassword">
            {(field) => (
              <field.TextField label="Confirm Password" type="password" />
            )}
          </form.AppField>
          <form.SubmitButton label="Submit" />
        </form>
      </form.AppForm>
    </LayoutCard>
  );
}

function TwoColumnGridForm() {
  const fieldSchemas = useMemo(
    () => ({
      firstName: z.string().min(2, "First name is required"),
      lastName: z.string().min(2, "Last name is required"),
      email: z.string().email("Invalid email address"),
      phone: z.string().min(6, "Phone is required"),
    }),
    [],
  );
  const form = useAppForm({
    ...twoColumnFormOpts,
  });

  return (
    <LayoutCard
      label="Two-Column Grid Form"
      description="Side-by-side fields on a responsive 2-column grid"
    >
      <form.AppForm>
        <form className="flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <form.AppField
              name="firstName"
              validators={{ onChange: fieldSchemas.firstName }}
            >
              {(field) => (
                <field.TextField label="First Name" placeholder="John" />
              )}
            </form.AppField>
            <form.AppField
              name="lastName"
              validators={{ onChange: fieldSchemas.lastName }}
            >
              {(field) => (
                <field.TextField label="Last Name" placeholder="Doe" />
              )}
            </form.AppField>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <form.AppField
              name="email"
              validators={{ onChange: fieldSchemas.email }}
            >
              {(field) => (
                <field.TextField label="Email" placeholder="john@example.com" />
              )}
            </form.AppField>
            <form.AppField
              name="phone"
              validators={{ onChange: fieldSchemas.phone }}
            >
              {(field) => (
                <field.TextField label="Phone" placeholder="+1 555 0123" />
              )}
            </form.AppField>
          </div>
          <form.SubmitButton label="Save" />
        </form>
      </form.AppForm>
    </LayoutCard>
  );
}

function IconPrefixedForm() {
  const fieldSchemas = useMemo(
    () => ({
      name: z.string().min(2, "Name is required"),
      mail: z.string().email("Invalid email"),
      lock: z.string().min(6, "Password must be at least 6 characters"),
    }),
    [],
  );
  const form = useAppForm({
    ...iconFormOpts,
  });

  return (
    <LayoutCard
      label="Icon-Prefixed Inputs"
      description="Inputs with leading SVG icons for a polished look"
    >
      <form.AppForm>
        <form className="flex flex-col gap-3">
          <form.AppField
            name="name"
            validators={{ onChange: fieldSchemas.name }}
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
            validators={{ onChange: fieldSchemas.mail }}
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
            validators={{ onChange: fieldSchemas.lock }}
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
          <form.SubmitButton label="Create Account" />
        </form>
      </form.AppForm>
    </LayoutCard>
  );
}

function SectionedCardForm() {
  const fieldSchemas = useMemo(
    () => ({
      firstName: z.string().min(2, "First name is required"),
      lastName: z.string().min(2, "Last name is required"),
      email: z.string().email("Invalid email"),
      phone: z.string().min(6, "Phone is required"),
      street: z.string().min(3, "Street is required"),
      city: z.string().min(2, "City is required"),
      state: z.string().min(2, "State is required"),
      zip: z.string().min(3, "ZIP code is required"),
    }),
    [],
  );
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
                validators={{ onChange: fieldSchemas.firstName }}
              >
                {(field) => <field.TextField label="First Name" />}
              </form.AppField>
              <form.AppField
                name="lastName"
                validators={{ onChange: fieldSchemas.lastName }}
              >
                {(field) => <field.TextField label="Last Name" />}
              </form.AppField>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <form.AppField
                name="email"
                validators={{ onChange: fieldSchemas.email }}
              >
                {(field) => <field.TextField label="Email" />}
              </form.AppField>
              <form.AppField
                name="phone"
                validators={{ onChange: fieldSchemas.phone }}
              >
                {(field) => <field.TextField label="Phone" />}
              </form.AppField>
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
          </div>

          <div className="border-border border-t" />

          <div className="flex flex-col gap-3">
            <p className="text-xxs text-muted tracking-wider uppercase">
              Address
            </p>
            <form.AppField
              name="street"
              validators={{ onChange: fieldSchemas.street }}
            >
              {(field) => <field.TextField label="Street" />}
            </form.AppField>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <form.AppField
                name="city"
                validators={{ onChange: fieldSchemas.city }}
              >
                {(field) => <field.TextField label="City" />}
              </form.AppField>
              <form.AppField
                name="state"
                validators={{ onChange: fieldSchemas.state }}
              >
                {(field) => <field.TextField label="State" />}
              </form.AppField>
              <form.AppField
                name="zip"
                validators={{ onChange: fieldSchemas.zip }}
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
        <BasicStackedForm />
        <TwoColumnGridForm />
        <IconPrefixedForm />
      </div>
      <SectionedCardForm />
    </div>
  );
}
