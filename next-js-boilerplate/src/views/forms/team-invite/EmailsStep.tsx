"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { IconX } from "@tabler/icons-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/button/icon-button";
import { Badge } from "@/components/ui/Badge";
import type { EmailsStepProps } from "@/types/views/forms/EmailsStep-types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MEMBER_EMAILS = new Set(["alice@example.com", "bob@example.com"]);

function validateEmail(
  value: string,
  emails: string[],
  t: Record<string, unknown>,
): string | null {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return null;
  if (!EMAIL_RE.test(trimmed)) return t.emailInvalid as string;
  if (emails.includes(trimmed)) return t.emailDuplicate as string;
  if (MEMBER_EMAILS.has(trimmed)) return t.emailAlreadyMember as string;
  return null;
}

export function EmailsStep({
  form,
  t,
  emailInputError,
  setEmailInputError,
}: EmailsStepProps) {
  const emails = form.state.values.emails;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium">{t.stepEmails as string}</p>
      <form.AppField name="emailInput">
        {(field: any) => (
          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <Input
                className="flex-1"
                value={field.state.value}
                onChange={(e) => {
                  field.handleChange(e.target.value);
                  if (emailInputError) setEmailInputError(null);
                }}
                onBlur={field.handleBlur}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const error = validateEmail(field.state.value, emails, t);
                    if (error) {
                      setEmailInputError(error);
                      return;
                    }
                    setEmailInputError(null);
                    form.pushFieldValue(
                      "emails",
                      field.state.value.trim().toLowerCase(),
                    );
                    field.handleChange("");
                  }
                }}
                placeholder={t.emailPlaceholder as string}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const error = validateEmail(field.state.value, emails, t);
                  if (error) {
                    setEmailInputError(error);
                    return;
                  }
                  setEmailInputError(null);
                  form.pushFieldValue(
                    "emails",
                    field.state.value.trim().toLowerCase(),
                  );
                  field.handleChange("");
                }}
              >
                {t.add as string}
              </Button>
            </div>
            {emailInputError && (
              <p className="text-xxs text-error">{emailInputError}</p>
            )}
          </div>
        )}
      </form.AppField>
      <div className="flex flex-wrap gap-1.5">
        {emails.map((email: string, index: number) => {
          const chipError = form.getFieldMeta(`emails[${index}]` as never)
            ?.errors?.[0];
          return (
            <div key={email} className="flex flex-col gap-0.5">
              <Badge variant="secondary" className="gap-1">
                {email}
                <IconButton
                  icon={<IconX size={12} />}
                  variant="ghost"
                  size="icon-xs"
                  className="text-error"
                  onClick={() => form.removeFieldValue("emails", index)}
                  label={`${t.emailChipRemove as string} ${email}`}
                />
              </Badge>
              {chipError && (
                <p className="text-xxs text-error">{chipError as string}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
