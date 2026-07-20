import type { ExceptionResponse } from "./api-client";

export type ExceptionCode =
  | "EX_VALIDATION_FORM"
  | "EX_AUTH_INVALID_CREDENTIALS"
  | "EX_AUTH_EMAIL_TAKEN"
  | "EX_AUTH_ACCOUNT_LOCKED"
  | "EX_AUTH_ACCOUNT_INACTIVE"
  | "EX_AUTH_INVALID_TOKEN"
  | "EX_AUTH_WEAK_PASSWORD"
  | "EX_AUTH_MFA_EXPIRED"
  | "EX_AUTH_MFA_NOT_ENABLED"
  | "EX_AUTH_MFA_INVALID_CODE"
  | "EX_CONFLICT_DUPLICATE"
  | "EX_CONFLICT_FOREIGN_KEY"
  | "EX_CONFLICT_RELATION"
  | "EX_INCONSISTENT_DATA"
  | "EX_NOT_FOUND"
  | "EX_FORBIDDEN"
  | "EX_WS_UNSTABLE"
  | "EX_TIER_INSUFFICIENT"
  | "EX_PROFILE_USERNAME_TAKEN"
  | "EX_API_KEY_NAME_EXISTS"
  | "EX_API_KEY_NOT_FOUND"
  | "EX_API_KEY_INVALID"
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
  EX_AUTH_ACCOUNT_INACTIVE: "full-page",
  EX_AUTH_INVALID_TOKEN: "toast",
  EX_AUTH_WEAK_PASSWORD: "form-field",
  EX_AUTH_MFA_EXPIRED: "toast",
  EX_AUTH_MFA_NOT_ENABLED: "toast",
  EX_AUTH_MFA_INVALID_CODE: "form-field",
  EX_CONFLICT_DUPLICATE: "toast",
  EX_CONFLICT_FOREIGN_KEY: "toast",
  EX_CONFLICT_RELATION: "toast",
  EX_INCONSISTENT_DATA: "toast",
  EX_NOT_FOUND: "full-page",
  EX_FORBIDDEN: "full-page",
  EX_WS_UNSTABLE: "badge",
  EX_TIER_INSUFFICIENT: "full-page",
  EX_PROFILE_USERNAME_TAKEN: "form-field",
  EX_API_KEY_NAME_EXISTS: "form-field",
  EX_API_KEY_NOT_FOUND: "toast",
  EX_API_KEY_INVALID: "toast",
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
