import { VALID_COUPONS } from "./billing-constants";
import { getSurface, exceptionHandler } from "@/lib/exception-handler";
import { exceptionToFormErrors } from "@/lib/forms/exception-to-form-errors";
import type { ExceptionResponse } from "@/lib/api-client";

export async function handleCouponBlur(
  value: string,
  deps: {
    simulateError: (
      id: string,
      opts?: { delayMs?: number },
    ) => Promise<ExceptionResponse>;
    toast: (opts: {
      description: string;
      variant?: "destructive" | "default";
    }) => void;
    allMessages: Record<string, unknown>;
  },
): Promise<string | undefined> {
  if (!value) return undefined;
  const upper = value.toUpperCase();
  if (VALID_COUPONS[upper]) return undefined;
  try {
    await deps.simulateError(
      upper === "EXPIRED10" ? "coupon-expired" : "coupon-invalid",
    );
    return undefined;
  } catch (err) {
    const exc = (err as { exception?: ExceptionResponse }).exception;
    if (!exc) return undefined;
    if (getSurface(exc.exc) === "toast") {
      deps.toast({
        description: exceptionHandler(exc, deps.allMessages),
        variant: "destructive",
      });
      return undefined;
    }
    return exceptionToFormErrors(exc, deps.allMessages).fields.couponCode;
  }
}
