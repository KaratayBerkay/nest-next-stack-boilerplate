import type { ToastOptions } from "@/types/ui/Toast-types";

export interface PremiumStats {
  totalUsers: number;
  activeUsers: number;
  revenue: number;
}

export interface PremiumGrowthStats {
  totalUsers: number;
  newUsersLast7Days: number;
  totalPosts: number;
  totalFriendships: number;
}

export type ToastFn = (options: ToastOptions) => string;
