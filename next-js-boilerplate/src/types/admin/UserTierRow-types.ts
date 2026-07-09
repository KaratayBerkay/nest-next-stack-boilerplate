export interface UserTierRowProps {
  user: { id: string; name: string; email: string };
  onSetTier: (userId: string, tier: string) => void;
}
