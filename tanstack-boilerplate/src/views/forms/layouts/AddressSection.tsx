/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { FieldInfoButton } from "@/components/ui/FieldInfoButton";
import { Dropdown } from "@/components/ui/Dropdown";
import { Label } from "@/components/ui/Label";
import type { AddressSectionProps } from "@/types/views/forms/AddressSection-types";

export function AddressSection({ form }: AddressSectionProps) {
  const t = useMessages("forms");

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xxs text-muted border-brand border-l-2 pl-3 tracking-wider uppercase">
        {t.layouts.sectioned_address}
      </p>
      <form.AppField name="street">
        {(field: any) => (
          <div className="flex items-center gap-1">
            <field.TextField
              label={t.layouts.sectionedStreet_label}
              placeholder={t.layouts.sectionedStreet_placeholder}
            />
            <FieldInfoButton description={t.layouts.sectionedStreet_info} />
          </div>
        )}
      </form.AppField>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <form.AppField name="city">
          {(field: any) => (
            <div className="flex items-center gap-1">
              <field.TextField
                label={t.layouts.sectionedCity_label}
                placeholder={t.layouts.sectionedCity_placeholder}
              />
              <FieldInfoButton description={t.layouts.sectionedCity_info} />
            </div>
          )}
        </form.AppField>
        <form.AppField name="state">
          {(field: any) => (
            <div className="flex items-center gap-1">
              <field.TextField
                label={t.layouts.sectionedState_label}
                placeholder={t.layouts.sectionedState_placeholder}
              />
              <FieldInfoButton description={t.layouts.sectionedState_info} />
            </div>
          )}
        </form.AppField>
        <form.AppField name="zip">
          {(field: any) => (
            <div className="flex items-center gap-1">
              <field.TextField
                label={t.layouts.sectionedZip_label}
                placeholder={t.layouts.sectionedZip_placeholder}
              />
              <FieldInfoButton description={t.layouts.sectionedZip_info} />
            </div>
          )}
        </form.AppField>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <Label>{t.layouts.sectionedCountry_label}</Label>
          <FieldInfoButton description={t.layouts.sectionedCountry_info} />
        </div>
        <Dropdown
          options={[
            { value: "us", label: t.layouts.sectionedCountry_us },
            { value: "ca", label: t.layouts.sectionedCountry_ca },
            { value: "uk", label: t.layouts.sectionedCountry_uk },
            { value: "tr", label: t.layouts.sectionedCountry_tr },
          ]}
          value={form.getFieldValue("country")}
          onChange={(value) => form.setFieldValue("country", value)}
          placeholder={t.layouts.sectionedCountry_placeholder}
        />
      </div>
    </div>
  );
}
