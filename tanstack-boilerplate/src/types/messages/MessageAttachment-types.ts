export interface MessageAttachment {
  url: string;
  type: string;
  name: string;
  size: number;
  /** Small server-generated preview, resolved server-side. Null when the type isn't thumbnailed or generation failed. */
  thumbnailUrl?: string | null;
  /** Server-side at-rest encryption metadata (ct omitted — too large for WS). */
  storageEnvelope?: { v: string; nonce: string } | null;
}
