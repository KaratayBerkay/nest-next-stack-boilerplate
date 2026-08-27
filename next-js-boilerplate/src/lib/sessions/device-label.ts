/**
 * A short "Browser on OS" label parsed from a raw User-Agent string, for
 * the Sessions list — the previous approach (first 3 space-separated
 * words) produced "Mozilla/5.0 (X11; Ubuntu;" for a real Linux/Firefox UA,
 * cutting off before either the OS or the browser was identifiable. The
 * full raw string is still shown verbatim under "More Device Info"; this
 * is only the compact summary label.
 */
export function deviceLabel(
  userAgent: string | undefined,
  deviceType: string | undefined,
  unknownLabel: string,
): string {
  if (!userAgent) return deviceType ?? unknownLabel;

  const os = parseOs(userAgent);
  const browser = parseBrowser(userAgent);

  if (browser && os) return `${browser} on ${os}`;
  if (browser) return browser;
  if (os) return os;
  return deviceType ?? unknownLabel;
}

function parseOs(ua: string): string | null {
  // iPhone/iPad UAs also contain the literal substring "like Mac OS X" (part
  // of their own OS token), so the iOS check has to come first.
  if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
  if (/Windows/.test(ua)) return "Windows";
  if (/Mac OS X|Macintosh/.test(ua)) return "macOS";
  if (/Android/.test(ua)) return "Android";
  if (/CrOS/.test(ua)) return "ChromeOS";
  if (/Linux/.test(ua)) return "Linux";
  return null;
}

// Order matters: Edge/Opera/Samsung Browser all also match /Chrome\//, and
// Chrome also matches /Safari\// — check the more specific tokens first.
function parseBrowser(ua: string): string | null {
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\/|Opera/.test(ua)) return "Opera";
  if (/SamsungBrowser\//.test(ua)) return "Samsung Internet";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Version\/.*Safari\//.test(ua)) return "Safari";
  if (/^node$/i.test(ua.trim())) return "API client";
  return null;
}
