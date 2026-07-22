import { useMessages } from "@/lib/i18n/MessagesProvider";
import { InputGroup } from "@/features/forms/ui/InputGroup";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { NativeSelect } from "@/components/ui/NativeSelect";
import { FieldInfoButton } from "@/components/ui/FieldInfoButton";
import { SectionCard } from "./SectionCard";

export function InputGroupsSection() {
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
