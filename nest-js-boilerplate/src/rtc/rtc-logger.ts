export function rtcLog(
  event: string,
  fields: Record<string, unknown> = {},
): Record<string, unknown> {
  return { ...fields, category: 'rtc', event };
}

export function rtcErrorLog(
  event: string,
  error: unknown,
  fields: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    ...rtcLog(event, fields),
    errorMessage: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  };
}
