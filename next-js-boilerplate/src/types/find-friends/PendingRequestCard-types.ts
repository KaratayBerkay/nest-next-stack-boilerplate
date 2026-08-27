import type { FriendRequest } from "@/views/find-friends/search-utils";

export interface PendingRequestCardProps {
  request: FriendRequest;
  onAccept: (userId: string) => Promise<boolean>;
  onDecline: (userId: string) => Promise<boolean>;
  sentByYouLabel: string;
  acceptLabel: string;
  declineLabel: string;
  awaitingLabel: string;
  acceptFailedMessage: string;
  declineFailedMessage: string;
}
