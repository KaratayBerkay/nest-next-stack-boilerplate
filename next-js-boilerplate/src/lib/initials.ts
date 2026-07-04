export function initials(name: string): string {
  const s = (name || "?").trim();
  if (!s) return "?";
  const parts = s.split(/\s+/);
  if (parts.length > 1) {
    return (parts[0][0] ?? "?").toUpperCase() + (parts[parts.length - 1][0] ?? "").toUpperCase();
  }
  return (s[0] || "?").toUpperCase();
}
