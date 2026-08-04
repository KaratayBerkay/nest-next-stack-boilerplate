/**
 * Wire-encryption envelope shapes shared by server and client.
 *
 * v2 = per-session transport encryption (trusted-server model): the server
 * holds an X25519 keypair per session in Redis, the client holds a device
 * keypair in IndexedDB, ECDH derives a shared secret, and every message body
 * crossing WS/HTTP is XChaCha20-Poly1305 ciphertext bound to
 * (sessionId, direction, seq) via AAD. The server can read messages; the
 * wire and the database cannot.
 */
export interface WireEnvelopeV2 {
  v: 2;
  nonce: string;
  ct: string;
}

/** At-rest envelope stored in the Postgres `envelope` JsonB column. */
export interface StorageEnvelopeV1 {
  v: 'storage-v1';
  nonce: string;
  ct: string;
}

/** AAD context separator — must match the frontend implementation exactly. */
export const WIRE_CRYPTO_CONTEXT = 'session-crypto-v1';
