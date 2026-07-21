"use client";

import { useAppForm } from "@/features/forms/form-hook";
import { useState } from "react";
import { InputGroup } from "@/features/forms/ui/InputGroup";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Checkbox } from "@/components/ui/Checkbox";
import { Switch } from "@/components/ui/Switch";
import { NativeSelect } from "@/components/ui/NativeSelect";
import { FileUpload } from "@/components/ui/FileUpload";
import { FieldInfoButton } from "@/components/ui/FieldInfoButton";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { elementsFieldSchemas } from "@/validators/forms/elements-validation";
import type { UploadFile } from "@/types/ui/FileUpload-types";
import type { SectionCardProps } from "@/types/forms/SectionCard-types";

function SectionCard({ label, children }: SectionCardProps) {
  return (
    <div className="surface border-border flex flex-col gap-3 rounded-lg border p-4 shadow-xs">
      <p className="text-xxs text-muted tracking-wider uppercase">{label}</p>
      {children}
    </div>
  );
}

function DefaultInputsSection() {
  const t = useMessages("forms");

  return (
    <SectionCard label={t.elements.section_defaultInputs}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Label>{t.elements.input_label}</Label>
            <FieldInfoButton description={t.elements.input_info} />
          </div>
          <Input placeholder={t.elements.input_placeholder} />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Label>{t.elements.inputWithPlaceholder_label}</Label>
            <FieldInfoButton
              description={t.elements.inputWithPlaceholder_info}
            />
          </div>
          <Input placeholder={t.elements.inputWithPlaceholder_placeholder} />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Label>{t.elements.selectInput_label}</Label>
            <FieldInfoButton description={t.elements.selectInput_info} />
          </div>
          <NativeSelect>
            <option value="">{t.elements.singleSelect_placeholder}</option>
            <option value="marketing">{t.elements.singleSelect_option1}</option>
            <option value="template">{t.elements.singleSelect_option2}</option>
            <option value="development">
              {t.elements.singleSelect_option3}
            </option>
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Label>{t.elements.passwordInput_label}</Label>
            <FieldInfoButton description={t.elements.passwordInput_info} />
          </div>
          <Input
            type="password"
            defaultValue="secret123"
            placeholder={t.elements.passwordInput_placeholder}
          />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Label>{t.elements.datePicker_label}</Label>
            <FieldInfoButton description={t.elements.datePicker_info} />
          </div>
          <Input type="date" />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Label>{t.elements.timeSelect_label}</Label>
            <FieldInfoButton description={t.elements.timeSelect_info} />
          </div>
          <Input type="time" />
        </div>
      </div>
    </SectionCard>
  );
}

function InputGroupsSection() {
  const t = useMessages("forms");

  const COUNTRY_OPTIONS = [
    { value: "us", label: t.elements.countryOption_us },
    { value: "gb", label: t.elements.countryOption_gb },
    { value: "ca", label: t.elements.countryOption_ca },
    { value: "au", label: t.elements.countryOption_au },
    { value: "tr", label: t.elements.countryOption_tr },
  ];

  return (
    <SectionCard label={t.elements.section_inputGroups}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Label>{t.elements.emailGroup_label}</Label>
            <FieldInfoButton description={t.elements.emailGroup_info} />
          </div>
          <InputGroup>
            <InputGroup.Prefix>@</InputGroup.Prefix>
            <Input
              placeholder={t.elements.emailGroup_placeholder}
              className="rounded-none rounded-r-md"
            />
          </InputGroup>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Label>{t.elements.phoneGroup_label}</Label>
            <FieldInfoButton description={t.elements.phoneGroup_info} />
          </div>
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
              placeholder={t.elements.phoneGroup_placeholder}
              className="rounded-none rounded-r-md"
            />
          </InputGroup>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Label>{t.elements.cardNumberGroup_label}</Label>
            <FieldInfoButton description={t.elements.cardNumberGroup_info} />
          </div>
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
              placeholder={t.elements.cardNumberGroup_placeholder}
              className="rounded-none rounded-r-md"
            />
          </InputGroup>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Label>{t.elements.websiteGroup_label}</Label>
            <FieldInfoButton description={t.elements.websiteGroup_info} />
          </div>
          <InputGroup>
            <InputGroup.Prefix className="text-xxs">http://</InputGroup.Prefix>
            <Input
              placeholder={t.elements.websiteGroup_placeholder}
              className="rounded-none rounded-r-md"
            />
          </InputGroup>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Label>{t.elements.referralGroup_label}</Label>
            <FieldInfoButton description={t.elements.referralGroup_info} />
          </div>
          <InputGroup>
            <Input
              placeholder={t.elements.referralGroup_placeholder}
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
          <div className="flex items-center gap-1">
            <Label>{t.elements.amountGroup_label}</Label>
            <FieldInfoButton description={t.elements.amountGroup_info} />
          </div>
          <InputGroup>
            <InputGroup.Prefix className="text-xs font-medium">
              $
            </InputGroup.Prefix>
            <Input
              type="number"
              placeholder={t.elements.amountGroup_placeholder}
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
  const t = useMessages("forms");

  const SINGLE_OPTIONS = [
    { value: "marketing", label: t.elements.singleSelect_option1 },
    { value: "template", label: t.elements.singleSelect_option2 },
    { value: "development", label: t.elements.singleSelect_option3 },
  ];

  return (
    <SectionCard label={t.elements.section_selectInputs}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Label>{t.elements.singleSelect_label}</Label>
            <FieldInfoButton description={t.elements.singleSelect_info} />
          </div>
          <NativeSelect>
            <option value="">{t.elements.singleSelect_placeholder}</option>
            {SINGLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Label>{t.elements.multiSelect_label}</Label>
            <FieldInfoButton description={t.elements.multiSelect_info} />
          </div>
          <div className="flex flex-wrap gap-1">
            {[
              t.elements.multiSelect_option1,
              t.elements.multiSelect_option2,
              t.elements.multiSelect_option3,
            ].map((label) => (
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
              {t.elements.multiSelect_chipAdd}
            </button>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function TextareaSection() {
  const t = useMessages("forms");

  return (
    <SectionCard label={t.elements.section_textarea}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Label>{t.elements.textareaDefault_label}</Label>
            <FieldInfoButton description={t.elements.textareaDefault_info} />
          </div>
          <textarea
            className="border-border placeholder:text-muted/70 focus-visible:ring-brand text-fg min-h-20 w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:ring-2 focus-visible:outline-none"
            placeholder={t.elements.textareaDefault_placeholder}
          />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Label>{t.elements.textareaCharCount_label}</Label>
            <FieldInfoButton description={t.elements.textareaCharCount_info} />
          </div>
          <textarea
            className="border-border placeholder:text-muted/70 focus-visible:ring-brand text-fg min-h-20 w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:ring-2 focus-visible:outline-none"
            placeholder={t.elements.textareaCharCount_placeholder}
            maxLength={100}
            defaultValue=""
          />
          <span className="text-muted ml-auto text-xs tabular-nums">0/100</span>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Label>{t.elements.textareaDisabled_label}</Label>
            <FieldInfoButton description={t.elements.textareaDisabled_info} />
          </div>
          <textarea
            className="border-border placeholder:text-muted/70 min-h-20 w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm opacity-50 shadow-sm"
            placeholder={t.elements.textareaDisabled_placeholder}
            disabled
          />
        </div>
      </div>
    </SectionCard>
  );
}

function InputStatesSection() {
  const t = useMessages("forms");

  return (
    <SectionCard label={t.elements.section_inputStates}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Label>{t.elements.errorState_label}</Label>
            <FieldInfoButton description={t.elements.errorState_info} />
          </div>
          <Input
            placeholder={t.elements.errorState_placeholder}
            className="border-error focus-visible:ring-error"
            error={t.elements.errorState_message}
          />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Label>{t.elements.successState_label}</Label>
            <FieldInfoButton description={t.elements.successState_info} />
          </div>
          <Input
            placeholder={t.elements.successState_placeholder}
            className="border-success"
            description={t.elements.successState_message}
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
  const t = useMessages("forms");

  return (
    <SectionCard label={t.elements.section_fileInput}>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <Label>{t.elements.fileInput_label}</Label>
          <FieldInfoButton description={t.elements.fileInput_info} />
        </div>
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
          {t.elements.fileInput_buttonLabel}
          <input type="file" className="sr-only" />
        </label>
      </div>
    </SectionCard>
  );
}

function DropzoneSection() {
  const t = useMessages("forms");
  const [files, setFiles] = useState<UploadFile[]>([]);

  return (
    <SectionCard label={t.elements.section_dropzone}>
      <FileUpload
        accept="image/*,.pdf"
        maxSizeBytes={5 * 1024 * 1024}
        files={files}
        onFilesChange={setFiles}
        labels={{
          dropzoneIdle: t.elements.dropzone_text,
          acceptedLabel: t.elements.dropzone_formats,
        }}
      />
    </SectionCard>
  );
}

function CheckboxSection() {
  const t = useMessages("forms");

  return (
    <SectionCard label={t.elements.section_checkboxes}>
      <div className="flex flex-wrap gap-6">
        <div className="flex items-center gap-2 text-sm">
          <Checkbox id="chk-default" />
          <label htmlFor="chk-default">
            {t.elements.checkboxDefault_label}
          </label>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Checkbox id="chk-checked" checked />
          <label htmlFor="chk-checked">
            {t.elements.checkboxChecked_label}
          </label>
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
  const t = useMessages("forms");

  return (
    <SectionCard label={t.elements.section_radioButtons}>
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
          <label htmlFor="radio-selected">
            {t.elements.radioSelected_label}
          </label>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="radio-demo-disabled"
            id="radio-disabled"
            disabled
            className="accent-brand"
          />
          <label htmlFor="radio-disabled">
            {t.elements.radioDisabled_label}
          </label>
        </div>
      </div>
    </SectionCard>
  );
}

function ToggleSection() {
  const t = useMessages("forms");

  return (
    <SectionCard label={t.elements.section_toggleSwitches}>
      <div className="flex flex-wrap gap-6">
        <div className="flex items-center gap-2 text-sm">
          <Switch id="toggle-default" />
          <label htmlFor="toggle-default">
            {t.elements.toggleDefault_label}
          </label>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Switch id="toggle-checked" defaultChecked />
          <label htmlFor="toggle-checked">
            {t.elements.toggleChecked_label}
          </label>
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
  const t = useMessages("forms");
  const form = useAppForm({
    defaultValues: { date: "", time: "" },
  });

  return (
    <SectionCard label={t.elements.section_dateTimePickers}>
      <form className="flex flex-col gap-4">
        <form.AppForm>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <form.AppField name="date">
              {(field) => (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <Label htmlFor={field.name}>
                      {t.elements.dateTimeDate_label}
                    </Label>
                    <FieldInfoButton
                      description={t.elements.dateTimeDate_info}
                    />
                  </div>
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
                  <div className="flex items-center gap-1">
                    <Label htmlFor={field.name}>
                      {t.elements.dateTimeTime_label}
                    </Label>
                    <FieldInfoButton
                      description={t.elements.dateTimeTime_info}
                    />
                  </div>
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
  const t = useMessages("forms");
  const form = useAppForm({
    defaultValues: { email: "", password: "", bio: "" },
  });

  return (
    <SectionCard label={t.elements.section_formValidation}>
      <p className="text-xxs text-muted">{t.elements.validation_info}</p>
      <form className="flex flex-col gap-3">
        <form.AppForm>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <form.AppField
              name="bio"
              validators={{ onChange: elementsFieldSchemas.bio }}
            >
              {(field) => (
                <field.TextField
                  label={t.elements.validationEmail_label}
                  placeholder={t.elements.validationEmail_placeholder}
                />
              )}
            </form.AppField>
            <form.AppField
              name="password"
              validators={{ onChange: elementsFieldSchemas.password }}
            >
              {(field) => (
                <field.TextField
                  label={t.elements.validationPassword_label}
                  type="password"
                  placeholder={t.elements.validationPassword_placeholder}
                  showPasswordToggle
                />
              )}
            </form.AppField>
          </div>
          <form.AppField
            name="bio"
            validators={{ onChange: elementsFieldSchemas.bio }}
          >
            {(field) => (
              <field.TextareaField
                label={t.elements.validationBio_label}
                hint={t.elements.validationBio_placeholder}
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
  const t = useMessages("forms");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-semibold">{t.elements.heading}</h2>
        <p className="text-muted text-xs">{t.elements.description}</p>
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
