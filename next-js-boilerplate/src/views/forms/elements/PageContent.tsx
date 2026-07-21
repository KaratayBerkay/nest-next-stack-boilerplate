"use client";

import { useAppForm } from "@/features/forms/form-hook";
import { useMemo, useState } from "react";
import { z } from "zod";
import { InputGroup } from "@/features/forms/ui/InputGroup";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Checkbox } from "@/components/ui/Checkbox";
import { Switch } from "@/components/ui/Switch";
import { NativeSelect } from "@/components/ui/NativeSelect";
import { FileUpload } from "@/components/ui/FileUpload";
import type { UploadFile } from "@/types/ui/FileUpload-types";

const COUNTRY_OPTIONS = [
  { value: "us", label: "US +1" },
  { value: "gb", label: "GB +44" },
  { value: "ca", label: "CA +1" },
  { value: "au", label: "AU +61" },
  { value: "tr", label: "TR +90" },
];

function SectionCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="surface border-border flex flex-col gap-3 rounded-lg border p-4">
      <p className="text-xxs text-muted tracking-wider uppercase">{label}</p>
      {children}
    </div>
  );
}

function DefaultInputsSection() {
  return (
    <SectionCard label="Default Inputs">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-1">
          <Label>Input</Label>
          <Input placeholder="Simple input field" />
        </div>
        <div className="flex flex-col gap-1">
          <Label>With Placeholder</Label>
          <Input placeholder="Placeholder text" />
        </div>
        <div className="flex flex-col gap-1">
          <Label>Select Input</Label>
          <NativeSelect>
            <option value="">Select Option</option>
            <option value="marketing">Marketing</option>
            <option value="template">Template</option>
            <option value="development">Development</option>
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-1">
          <Label>Password Input</Label>
          <Input
            type="password"
            defaultValue="secret123"
            placeholder="••••••••"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label>Date Picker</Label>
          <Input type="date" />
        </div>
        <div className="flex flex-col gap-1">
          <Label>Time Select</Label>
          <Input type="time" />
        </div>
      </div>
    </SectionCard>
  );
}

function InputGroupsSection() {
  return (
    <SectionCard label="Input Groups">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <Label>Email</Label>
          <InputGroup>
            <InputGroup.Prefix>@</InputGroup.Prefix>
            <Input
              placeholder="your@email.com"
              className="rounded-none rounded-r-md"
            />
          </InputGroup>
        </div>
        <div className="flex flex-col gap-1">
          <Label>Phone</Label>
          <InputGroup>
            <InputGroup.Prefix>
              <NativeSelect className="border-0 bg-transparent p-0 text-xs">
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </NativeSelect>
            </InputGroup.Prefix>
            <Input
              placeholder="555-0123"
              className="rounded-none rounded-r-md"
            />
          </InputGroup>
        </div>
        <div className="flex flex-col gap-1">
          <Label>Card Number</Label>
          <InputGroup>
            <InputGroup.Prefix>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
            </InputGroup.Prefix>
            <Input
              placeholder="4242 4242 4242 4242"
              className="rounded-none rounded-r-md"
            />
          </InputGroup>
        </div>
        <div className="flex flex-col gap-1">
          <Label>Website</Label>
          <InputGroup>
            <InputGroup.Prefix className="text-xxs">http://</InputGroup.Prefix>
            <Input
              placeholder="example.com"
              className="rounded-none rounded-r-md"
            />
          </InputGroup>
        </div>
        <div className="flex flex-col gap-1">
          <Label>Referral Code</Label>
          <InputGroup>
            <Input
              placeholder="REF-XXXX"
              className="rounded-none rounded-l-md"
            />
            <InputGroup.Suffix>
              <button
                type="button"
                onClick={() => {}}
                className="text-xs font-medium"
              >
                Copy
              </button>
            </InputGroup.Suffix>
          </InputGroup>
        </div>
        <div className="flex flex-col gap-1">
          <Label>Amount</Label>
          <InputGroup>
            <InputGroup.Prefix className="text-xs font-medium">
              $
            </InputGroup.Prefix>
            <Input
              type="number"
              placeholder="0.00"
              className="rounded-none rounded-r-md"
            />
            <InputGroup.Suffix className="text-xs">USD</InputGroup.Suffix>
          </InputGroup>
        </div>
      </div>
    </SectionCard>
  );
}

function SelectsSection() {
  const SINGLE_OPTIONS = [
    { value: "marketing", label: "Marketing" },
    { value: "template", label: "Template" },
    { value: "development", label: "Development" },
  ];

  return (
    <SectionCard label="Select Inputs">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <Label>Single Select</Label>
          <NativeSelect>
            <option value="">Select Option</option>
            {SINGLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-1">
          <Label>Multi Select</Label>
          <div className="flex flex-wrap gap-1">
            {["Marketing", "Template", "Development"].map((label) => (
              <span
                key={label}
                className="border-border bg-muted/10 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs"
              >
                {label}
                <button
                  type="button"
                  className="text-muted hover:text-fg ml-0.5 leading-none"
                >
                  &times;
                </button>
              </span>
            ))}
            <button
              type="button"
              className="border-border text-muted hover:text-fg inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs"
            >
              + Add
            </button>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function TextareaSection() {
  return (
    <SectionCard label="Textarea Input Field">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <Label>Default</Label>
          <textarea
            className="border-border placeholder:text-muted/70 focus-visible:ring-brand text-fg min-h-20 w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:ring-2 focus-visible:outline-none"
            placeholder="Write a message..."
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label>With Char Count</Label>
          <textarea
            className="border-border placeholder:text-muted/70 focus-visible:ring-brand text-fg min-h-20 w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:ring-2 focus-visible:outline-none"
            placeholder="Max 100 chars..."
            maxLength={100}
            defaultValue=""
          />
          <span className="text-muted ml-auto text-xs tabular-nums">0/100</span>
        </div>
        <div className="flex flex-col gap-1">
          <Label>Disabled</Label>
          <textarea
            className="border-border placeholder:text-muted/70 min-h-20 w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm opacity-50 shadow-sm"
            placeholder="Cannot edit"
            disabled
          />
        </div>
      </div>
    </SectionCard>
  );
}

function InputStatesSection() {
  return (
    <SectionCard label="Input States">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <Label>Error</Label>
          <Input
            placeholder="Invalid value"
            className="border-error focus-visible:ring-error"
            error="This field has an error"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label>Success</Label>
          <Input
            placeholder="Valid value"
            className="border-success"
            description="Looks good!"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label>Disabled</Label>
          <Input placeholder="Cannot edit" disabled />
        </div>
      </div>
    </SectionCard>
  );
}

function FileInputSection() {
  return (
    <SectionCard label="File Input">
      <div className="flex flex-col gap-1">
        <Label>Upload File</Label>
        <label className="border-border text-muted hover:bg-surface-hover hover:text-fg inline-flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm transition-colors">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Choose File
          <input type="file" className="sr-only" />
        </label>
      </div>
    </SectionCard>
  );
}

function DropzoneSection() {
  const [files, setFiles] = useState<UploadFile[]>([]);

  return (
    <SectionCard label="Dropzone">
      <FileUpload
        accept="image/*,.pdf"
        maxSizeBytes={5 * 1024 * 1024}
        files={files}
        onFilesChange={setFiles}
        labels={{
          dropzoneIdle: "Drag & drop your files here or click to browse",
          acceptedLabel: "Accepted formats",
        }}
      />
    </SectionCard>
  );
}

function CheckboxSection() {
  return (
    <SectionCard label="Checkboxes">
      <div className="flex flex-wrap gap-6">
        <div className="flex items-center gap-2 text-sm">
          <Checkbox id="chk-default" />
          <label htmlFor="chk-default">Default</label>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Checkbox id="chk-checked" checked />
          <label htmlFor="chk-checked">Checked</label>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Checkbox id="chk-disabled" disabled />
          <label htmlFor="chk-disabled">Disabled</label>
        </div>
      </div>
    </SectionCard>
  );
}

function RadioSection() {
  return (
    <SectionCard label="Radio Buttons">
      <div className="flex flex-wrap gap-6">
        <div className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="radio-demo"
            id="radio-default"
            className="accent-brand"
          />
          <label htmlFor="radio-default">Default</label>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="radio-demo"
            id="radio-selected"
            defaultChecked
            className="accent-brand"
          />
          <label htmlFor="radio-selected">Selected</label>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="radio-demo-disabled"
            id="radio-disabled"
            disabled
            className="accent-brand"
          />
          <label htmlFor="radio-disabled">Disabled</label>
        </div>
      </div>
    </SectionCard>
  );
}

function ToggleSection() {
  return (
    <SectionCard label="Toggle Switches">
      <div className="flex flex-wrap gap-6">
        <div className="flex items-center gap-2 text-sm">
          <Switch id="toggle-default" />
          <label htmlFor="toggle-default">Default</label>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Switch id="toggle-checked" defaultChecked />
          <label htmlFor="toggle-checked">Checked</label>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Switch id="toggle-disabled" disabled />
          <label htmlFor="toggle-disabled">Disabled</label>
        </div>
      </div>
    </SectionCard>
  );
}

function DateTimeSection() {
  const form = useAppForm({
    defaultValues: { date: "", time: "" },
  });

  return (
    <SectionCard label="Date & Time Pickers">
      <form className="flex flex-col gap-4">
        <form.AppForm>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <form.AppField name="date">
              {(field) => (
                <div className="flex flex-col gap-1">
                  <Label htmlFor={field.name}>Date Picker</Label>
                  <Input
                    id={field.name}
                    type="date"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.AppField>
            <form.AppField name="time">
              {(field) => (
                <div className="flex flex-col gap-1">
                  <Label htmlFor={field.name}>Time Picker</Label>
                  <Input
                    id={field.name}
                    type="time"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.AppField>
          </div>
        </form.AppForm>
      </form>
    </SectionCard>
  );
}

function FormValidationSection() {
  const fieldSchemas = useMemo(
    () => ({
      email: z.string().email("Invalid email address"),
      password: z.string().min(6, "Password must be at least 6 characters"),
      bio: z.string().max(200, "Bio must be 200 characters or fewer"),
    }),
    [],
  );
  const form = useAppForm({
    defaultValues: { email: "", password: "", bio: "" },
  });

  return (
    <SectionCard label="Form with Validation">
      <p className="text-xxs text-muted">
        TanStack Form fields with onChange Zod validation and a password toggle
        example.
      </p>
      <form className="flex flex-col gap-3">
        <form.AppForm>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <form.AppField
              name="email"
              validators={{ onChange: fieldSchemas.email }}
            >
              {(field) => (
                <field.TextField label="Email" placeholder="your@email.com" />
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
          </div>
          <form.AppField name="bio" validators={{ onChange: fieldSchemas.bio }}>
            {(field) => (
              <field.TextareaField
                label="Bio"
                hint="Tell us about yourself"
                maxLength={200}
              />
            )}
          </form.AppField>
        </form.AppForm>
      </form>
    </SectionCard>
  );
}

export default function FormElementsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-semibold">Form Elements</h2>
        <p className="text-muted text-xs">
          Input groups, selects, textareas, file uploads, date pickers,
          checkboxes, radios, toggles, and validation states.
        </p>
      </div>
      <DefaultInputsSection />
      <InputGroupsSection />
      <SelectsSection />
      <TextareaSection />
      <InputStatesSection />
      <FileInputSection />
      <DropzoneSection />
      <DateTimeSection />
      <CheckboxSection />
      <RadioSection />
      <ToggleSection />
      <FormValidationSection />
    </div>
  );
}
