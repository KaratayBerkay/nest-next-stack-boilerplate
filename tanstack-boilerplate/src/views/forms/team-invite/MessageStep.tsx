"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import type { MessageStepProps } from "@/types/views/forms/MessageStep-types";

export function MessageStep({ form, t }: MessageStepProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium">{t.stepMessage as string}</p>
      <form.AppField name="message">
        {(field: any) => (
          <field.TextareaField
            label={t.messageLabel as string}
            placeholder={t.messagePlaceholder as string}
          />
        )}
      </form.AppField>
    </div>
  );
}
