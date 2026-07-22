import type { FriendRequest } from "@/views/find-friends/search-utils";

export interface PendingRequestCardProps {
  request: FriendRequest;
  onAccept: (userId: string) => void;
  onDecline: (userId: string) => void;
  sentByYouLabel: string;
  acceptLabel: string;
  declineLabel: string;
  awaitingLabel: string;
}
