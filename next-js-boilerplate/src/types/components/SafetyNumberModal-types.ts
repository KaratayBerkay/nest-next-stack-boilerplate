export interface SafetyNumberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  peerUserId: string;
  peerName: string;
  ownUserId: string;
  ownFingerprint?: string;
  peerFingerprint?: string;
}

export interface SafetyNumberBadgeProps {
  peerUserId: string;
  peerName: string;
  ownUserId: string;
  ownFingerprint?: string;
  peerFingerprint?: string;
}
