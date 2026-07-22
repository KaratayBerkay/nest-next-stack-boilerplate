"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FieldMessages } from "@/components/ui/field-messages";
import { RegisterFormFields } from "./RegisterFormFields";
import { SocialButtons } from "./SocialButtons";
import type { RegisterFormProps } from "@/types/ui/RegisterForm-types";

export function RegisterForm({
  form,
  registerSchema,
  formError,
  t,
}: RegisterFormProps) {
  return (
    <Card className="w-full max-w-[480px]">
      <CardContent className="pt-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-5"
        >
          <RegisterFormFields form={form} registerSchema={registerSchema} t={t} />

          {formError && <FieldMessages error={formError} />}

          <div>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <form.Subscribe selector={(s: any) => [s.canSubmit, s.isSubmitting]}>
              {([canSubmit, isSubmitting]: [boolean, boolean]) => (
                <Button
                  type="submit"
                  className="w-full"
                  loading={isSubmitting}
                  disabled={!canSubmit}
                >
                  {isSubmitting
                    ? t.form.register.submitting
                    : t.form.register.submit}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>

        <SocialButtons />
      </CardContent>
    </Card>
  );
}
