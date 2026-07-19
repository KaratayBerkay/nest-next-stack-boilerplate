import type { ExceptionResponse } from "./api-client";

export type ExceptionCode =
  | "EX_VALIDATION_FORM"
  | "EX_AUTH_INVALID_CREDENTIALS"
  | "EX_AUTH_EMAIL_TAKEN"
  | "EX_AUTH_ACCOUNT_LOCKED"
  | "EX_CONFLICT_DUPLICATE"
  | "EX_NOT_FOUND"
  | "EX_FORBIDDEN"
  | "EX_WS_UNSTABLE"
  | "EX_TIER_INSUFFICIENT"
  | "EX_INTERNAL";

export type ClientException = Omit<ExceptionResponse, "statusCode">;

export type ExceptionSurface =
  | "toast"
  | "alert"
  | "badge"
  | "form-field"
  | "full-page";

const EXC_TO_SURFACE = {
  EX_VALIDATION_FORM: "form-field",
  EX_AUTH_INVALID_CREDENTIALS: "toast",
  EX_AUTH_EMAIL_TAKEN: "form-field",
  EX_AUTH_ACCOUNT_LOCKED: "toast",
  EX_CONFLICT_DUPLICATE: "toast",
  EX_NOT_FOUND: "full-page",
  EX_FORBIDDEN: "full-page",
  EX_WS_UNSTABLE: "badge",
  EX_TIER_INSUFFICIENT: "full-page",
  EX_INTERNAL: "toast",
} satisfies Record<ExceptionCode, ExceptionSurface>;

export function getSurface(exc: string): ExceptionSurface {
  if (!(exc in EXC_TO_SURFACE)) {
    console.warn(
      `[exception-handler] Unknown exception code "${exc}" — falling back to "toast"`,
    );
  }
  return EXC_TO_SURFACE[exc as ExceptionCode] ?? "toast";
}

export function resolveByPath(
  obj: Record<string, unknown> | undefined | null,
  path: string,
): string | undefined {
  if (!obj) return undefined;
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (typeof current !== "object" || current === null) return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : undefined;
}

export function exceptionHandler(
  error: ExceptionResponse | ClientException,
  messages?: Record<string, unknown>,
): string {
  if (error.key && messages) {
    const resolved = resolveByPath(messages, error.key);
    if (resolved) return resolved;
  }
  return error.msg;
}

export function clientException(
  exc: ExceptionCode,
  msg: string,
  key?: string,
): ClientException {
  return {
    exc,
    msg,
    key: key ?? `error.${exc.toLowerCase().replace(/^ex_/, "client_")}`,
  };
}
