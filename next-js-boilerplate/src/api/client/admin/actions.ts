import type { AdminUserResult } from "@/api/server/admin/search-users";
import type { SetTierResult } from "@/api/server/admin/set-tier";

export function useAdminActions() {
  const setTier = async (userId: string, tier: string): Promise<SetTierResult> => {
    const { setTierServer } = await import("@/api/server/admin/set-tier");
    return setTierServer(userId, tier);
  };

  const searchUsers = async (q: string): Promise<AdminUserResult[]> => {
    const { searchAdminUsersServer } = await import(
      "@/api/server/admin/search-users"
    );
    return searchAdminUsersServer(q);
  };

  return { setTier, searchUsers };
}
