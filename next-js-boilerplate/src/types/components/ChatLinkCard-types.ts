export interface ChatLinkCardProps {
  /** The URL exactly as it appeared in the message. */
  url: string;
  /** Passed the https + public-domain policy (see lib/chat/link-preview) —
   *  renders as a real link; otherwise the card is copy-only. */
  clickable: boolean;
}
