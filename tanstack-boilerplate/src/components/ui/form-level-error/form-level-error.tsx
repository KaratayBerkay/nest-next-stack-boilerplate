"use client";

import { FormErrorBanner } from "@/components/ui/FormErrorBanner";
import type { FormLevelErrorProps } from "@/types/ui/FormLevelError-types";

export function FormLevelError({ form }: FormLevelErrorProps) {
  return (
    <form.Subscribe selector={(state) => state.errorMap.onSubmit}>
      {(onSubmitError) =>
        onSubmitError ? (
          <FormErrorBanner
            message={String(onSubmitError)}
            onDismiss={() => form.setErrorMap({ onSubmit: undefined })}
          />
        ) : null
      }
    </form.Subscribe>
  );
}
