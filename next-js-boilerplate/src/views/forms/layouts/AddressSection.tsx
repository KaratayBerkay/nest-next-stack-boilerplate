/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { FieldInfoButton } from "@/components/ui/FieldInfoButton";
import { NativeSelect } from "@/components/ui/NativeSelect";
import { Label } from "@/components/ui/Label";

interface AddressSectionProps {
  form: any;
}

export function AddressSection({ form }: AddressSectionProps) {
  const t = useMessages("forms");

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xxs text-muted border-brand border-l-2 pl-3 tracking-wider uppercase">
        Address
      </p>
      <form.AppField name="street">
        {(field: any) => (
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
        <form.AppField name="city">
          {(field: any) => (
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
        <form.AppField name="state">
          {(field: any) => (
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
        <form.AppField name="zip">
          {(field: any) => (
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
  );
}
