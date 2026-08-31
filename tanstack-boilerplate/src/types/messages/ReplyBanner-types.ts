import type { ReplyPreview } from "./ChatView-types";

export interface ReplyBannerProps {
  replyTarget: ReplyPreview;
  isReplyToMe: boolean;
  peerName: string;
  onCancel: () => void;
}
