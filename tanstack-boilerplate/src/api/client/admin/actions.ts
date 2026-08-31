import type { AdminUserResult } from "@/api/server/admin/search-users";
import type { SetTierResult } from "@/api/server/admin/set-tier";
import type { SetStatusResult } from "@/api/server/admin/set-status";
import type { ResetMfaResult } from "@/api/server/admin/reset-mfa";

export function useAdminActions() {
  const setTier = async (
    userId: string,
    tier: string,
  ): Promise<SetTierResult> => {
    const { setTierServer } = await import("@/api/server/admin/set-tier");
    return setTierServer(userId, tier);
  };

  const setStatus = async (
    userId: string,
    status: string,
    reason?: string,
  ): Promise<SetStatusResult> => {
    const { setStatusServer } = await import("@/api/server/admin/set-status");
    return setStatusServer(userId, status, reason);
  };

  const resetMfa = async (userId: string): Promise<ResetMfaResult> => {
    const { resetMfaServer } = await import("@/api/server/admin/reset-mfa");
    return resetMfaServer(userId);
  };

  const searchUsers = async (q: string): Promise<AdminUserResult[]> => {
    const { searchAdminUsersServer } =
      await import("@/api/server/admin/search-users");
    return searchAdminUsersServer(q);
  };

  return { setTier, setStatus, resetMfa, searchUsers };
}
