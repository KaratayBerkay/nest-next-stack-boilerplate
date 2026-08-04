/**
 * Minimal type definitions for the crypto module.
 * Only types still used by surviving modules (attachments.ts).
 */

export interface MessagePlaintextV1 {
  text?: string;
  attachment?: {
    key: string;
    nonce: string;
    originalName: string;
    originalType: string;
    originalSize: number;
  };
}
