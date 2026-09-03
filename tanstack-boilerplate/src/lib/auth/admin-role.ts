/**
 * Roles allowed into /admin, /admin/audit-logs and the Premium tier-gate demo
 * (CROSS-035/CROSS-039). Shared by the server-side gates and the client-side
 * defense-in-depth checks so the two can never drift apart.
 */
export const ADMIN_ROLES = ["ADMIN", "SUPERADMIN"] as const;

export function isAdminRole(role: string | null | undefined): boolean {
  return role != null && (ADMIN_ROLES as readonly string[]).includes(role);
}
