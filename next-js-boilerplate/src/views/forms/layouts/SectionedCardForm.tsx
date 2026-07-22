import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useStore } from "@tanstack/react-form";
import { useAppForm } from "@/features/forms/form-hook";
import { createFormSubmitHandler } from "@/lib/forms/shared";
import { sectionedFormOpts } from "@/validators/forms/layouts-inits";
import { Button } from "@/components/ui/Button";
import { LayoutCard } from "./LayoutCard";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { AddressSection } from "./AddressSection";
import { MembershipSection } from "./MembershipSection";

export function SectionedCardForm() {
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
          <PersonalInfoSection form={form} />
          <div className="border-border border-t" />
          <AddressSection form={form} />
          <div className="border-border border-t" />
          <MembershipSection form={form} />
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
