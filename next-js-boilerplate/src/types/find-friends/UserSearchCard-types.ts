export interface UserSearchCardProps {
  userId: string;
  name: string;
  isPending: boolean;
  onSendRequest: () => void;
  pendingLabel: string;
  addFriendLabel: string;
}
