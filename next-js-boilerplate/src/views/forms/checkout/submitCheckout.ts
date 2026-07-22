import { formOptions } from "@tanstack/react-form";
import { useToast } from "@/components/ui/Toast";
import { checkoutSchema } from "@/validators/forms/checkout";
import { checkoutDefaultValues } from "@/validators/forms/checkout-inits";
import { getSurface, exceptionHandler } from "@/lib/exception-handler";
import { exceptionToFormErrors } from "@/lib/forms/exception-to-form-errors";
import type { ExceptionResponse } from "@/lib/api-client";
import type { z } from "zod";

export const checkoutFormOpts = formOptions({
  defaultValues: checkoutDefaultValues satisfies z.input<typeof checkoutSchema>,
});

export async function submitCheckout(
  { value }: { value: typeof checkoutFormOpts.defaultValues },
  deps: {
    simulateError: (
      id: string,
      opts?: { failRate?: number },
    ) => Promise<ExceptionResponse>;
    toast: ReturnType<typeof useToast>["toast"];
    allMessages: Record<string, unknown>;
  },
) {
  try {
    if (value.shippingAddress.postalCode === "00000") {
      await deps.simulateError("postal-code-group", { failRate: 1 });
    } else {
      await deps.simulateError("payment-declined", { failRate: 0 });
    }
    return null;
  } catch (err) {
    const exc = (err as { exception?: ExceptionResponse }).exception;
    if (!exc) return { form: "Order failed", fields: {} };
    if (getSurface(exc.exc) === "toast") {
      deps.toast({
        description: exceptionHandler(exc, deps.allMessages),
        variant: "destructive",
      });
      return null;
    }
    return exceptionToFormErrors(exc, deps.allMessages);
  }
}
