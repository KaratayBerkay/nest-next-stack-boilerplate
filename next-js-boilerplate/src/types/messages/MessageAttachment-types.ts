export interface MessageAttachment {
  url: string;
  type: string;
  name: string;
  /** Server-side at-rest encryption envelope for this attachment blob. */
  storageEnvelope?: { v: string; nonce: string; ct: string } | null;
}
