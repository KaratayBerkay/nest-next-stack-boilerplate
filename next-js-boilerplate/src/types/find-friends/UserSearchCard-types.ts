export interface UserSearchCardProps {
  userId: string;
  name: string;
  isPending: boolean;
  onSendRequest: () => Promise<boolean>;
  pendingLabel: string;
  addFriendLabel: string;
  sendFailedMessage: string;
}
