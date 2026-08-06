export interface MessageAttachment {
  url: string;
  type: string;
  name: string;
  /** Server-side at-rest encryption metadata (ct omitted — too large for WS). */
  storageEnvelope?: { v: string; nonce: string } | null;
}
