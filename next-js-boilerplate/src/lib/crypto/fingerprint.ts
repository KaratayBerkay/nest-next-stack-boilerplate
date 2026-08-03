/**
 * Safety number computation (§1.6 of the plan).
 *
 * Per-user fingerprint = digits of SHA-256(userId || IK_sig_pub), displayed
 * in grouped chunks (Signal-style, simplified).  A DM's safety number is
 * both parties' fingerprints in canonical order.
 */

import { computeFingerprint, fromHex } from "./primitives";

/**
 * Encode raw hash bytes as decimal digits, 5 digits per big-endian 16-bit
 * chunk (0-65535, zero-padded) — the same shape Signal's own safety-number
 * display uses. This is injective (each 2-byte chunk maps to exactly one
 * 5-digit group) and preserves the hash's full entropy across every digit.
 *
 * This deliberately replaces a naive "map each hex nibble to its decimal
 * value" approach, which is neither: nibbles 0-9 contribute one digit while
 * a-f contribute two, so the digit count varies per hash and the output had
 * to be zero-padded to a fixed length — meaning most displayed digits were
 * constant padding, not actual key material — and the mapping isn't even
 * unique (hex nibbles [10, 1] and [1, 0, 1] both produce the digit string
 * "101"), so two different keys could display an identical fingerprint.
 */
function bytesToDigits(bytes: Uint8Array): string {
  let digits = "";
  for (let i = 0; i < bytes.length; i += 2) {
    const high = bytes[i];
    const low = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const chunk = (high << 8) | low;
    digits += chunk.toString().padStart(5, "0");
  }
  return digits;
}

/**
 * Compute a user's fingerprint: SHA-256(userId || identitySigningKey).
 * Returns an 80-digit decimal string (16 chunks of 2 bytes, 5 digits each).
 */
export function computeUserFingerprint(
  userId: string,
  identitySigningKey: string,
): string {
  const hex = computeFingerprint(userId, identitySigningKey);
  return bytesToDigits(fromHex(hex));
}

/**
 * Compute a DM safety number: both parties' fingerprints, concatenated in
 * canonical order (lexicographic sort of (userId_A, userId_B)) so both
 * sides display the identical combined string.
 *
 * This is a plain concatenation, not a re-hash of the two fingerprints —
 * combining them through a further (especially a non-cryptographic,
 * fixed-width) hash would collapse their combined entropy down to
 * whatever that hash's output space is. A 32-bit hash, for instance, has
 * only ~4.3 billion possible outputs — trivially brute-forceable — which
 * would let an attacker who has substituted a peer's identity key search
 * for a fake key that happens to produce the SAME displayed safety
 * number, defeating the one feature (§1.6) that exists specifically to
 * catch that substitution.
 */
export function computeDmSafetyNumber(
  userIdA: string,
  fingerprintA: string,
  userIdB: string,
  fingerprintB: string,
): string {
  const [first, second] =
    userIdA < userIdB
      ? [fingerprintA, fingerprintB]
      : [fingerprintB, fingerprintA];
  return first + second;
}

/**
 * Format a fingerprint into display groups (4 digits per group).
 * Example: "1234 5678 9012 3456 ..."
 */
export function formatFingerprint(fingerprint: string): string {
  return fingerprint.replace(/(.{4})/g, "$1 ").trim();
}

/**
 * Verify that two fingerprints match (for safety number verification).
 */
export function verifyFingerprint(a: string, b: string): boolean {
  return a === b;
}
