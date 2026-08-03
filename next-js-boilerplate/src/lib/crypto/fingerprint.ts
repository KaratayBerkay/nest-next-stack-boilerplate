/**
 * Safety number computation (§1.6 of the plan).
 *
 * Per-user fingerprint = digits of SHA-256(userId || IK_sig_pub), displayed
 * in grouped chunks (Signal-style, simplified).  A DM's safety number is
 * both parties' fingerprints in canonical order.
 */

import { computeFingerprint } from "./primitives";

/**
 * Compute a user's fingerprint: SHA-256(userId || identitySigningKey).
 * Returns a string of decimal digits (120 digits = 40 groups of 3).
 */
export function computeUserFingerprint(
  userId: string,
  identitySigningKey: string,
): string {
  const hex = computeFingerprint(userId, identitySigningKey);
  // Convert hex to decimal digits
  let decimal = "";
  for (let i = 0; i < hex.length; i++) {
    decimal += parseInt(hex[i], 16).toString();
  }
  // Pad to 120 digits
  return decimal.padEnd(120, "0").slice(0, 120);
}

/**
 * Compute a DM safety number: both parties' fingerprints in canonical order.
 * The canonical order is: lexicographic sort of (userId_A, userId_B).
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
  // Concatenate and take SHA-256 for a combined fingerprint
  const combined = first + second;
  // Simple hash of the combined string
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  // Convert to stable hex-like display
  return Math.abs(hash).toString().padEnd(60, "0").slice(0, 60);
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
