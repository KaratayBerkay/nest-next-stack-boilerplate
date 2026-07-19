import { resolveByPath } from "@/lib/exception-handler";
import type { ExceptionResponse } from "@/lib/api-client";

const toFormPath = (field: string) => field.replace(/\.(\d+)(?=\.|$)/g, "[$1]");

export function exceptionToFormErrors(
  exc: ExceptionResponse,
  messages: Record<string, unknown>,
): { form: string | null; fields: Record<string, string> } {
  const resolve = (key: string, fallback: string) =>
    (resolveByPath(messages, key) as string | undefined) ?? fallback;
  const targets = exc.fields?.length
    ? exc.fields
    : exc.field
      ? [{ field: exc.field, msg: exc.msg, key: exc.key }]
      : [];
  const fields = Object.fromEntries(
    targets.map((t) => [toFormPath(t.field), resolve(t.key, t.msg)]),
  );
  return targets.length
    ? { form: null, fields }
    : { form: resolve(exc.key, exc.msg), fields: {} };
}
