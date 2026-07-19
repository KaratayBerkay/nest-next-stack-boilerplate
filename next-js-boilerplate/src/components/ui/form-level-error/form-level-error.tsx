"use client";

import { FormErrorBanner } from "@/components/ui/FormErrorBanner";
import type { FormLevelErrorProps } from "@/types/ui/FormLevelError-types";

export function FormLevelError({ form }: FormLevelErrorProps) {
  return (
    <form.Subscribe selector={(state: { errorMap?: { onSubmit?: string } }) => state.errorMap?.onSubmit}>
      {(onSubmitError: string | undefined) => onSubmitError ? (
        <FormErrorBanner
          message={String(onSubmitError)}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onDismiss={() => (form as any).setErrorMap({ onSubmit: undefined })}
        />
      ) : null}
    </form.Subscribe>
  );
}
