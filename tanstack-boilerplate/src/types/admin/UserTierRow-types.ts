export interface UserTierRowProps {
  user: {
    id: string;
    name: string;
    email: string;
    status: string;
    subscriptionTier: string;
  };
  onSetTier: (userId: string, tier: string) => void;
  onSetStatus: (userId: string, status: string) => void;
  onResetMfa: (userId: string) => void;
  canResetMfa: boolean;
}
