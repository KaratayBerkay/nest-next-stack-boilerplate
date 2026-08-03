/**
 * Safety-number / fingerprint tests (§1.6).
 *
 * These specifically guard against two bugs found in an independent
 * security review: the original hex-nibble-to-decimal encoding was not
 * injective (two different key bytes could render the same fingerprint),
 * and the DM safety number combiner collapsed both fingerprints through a
 * 32-bit non-cryptographic hash — a space trivially brute-forceable by an
 * attacker searching for a substitute identity key that renders the same
 * displayed number, defeating the one feature that exists to catch a
 * server substituting someone's identity key.
 */

import { describe, it, expect } from "vitest";
import {
  computeUserFingerprint,
  computeDmSafetyNumber,
  formatFingerprint,
  verifyFingerprint,
} from "./fingerprint";

describe("computeUserFingerprint", () => {
  it("is deterministic", () => {
    const a = computeUserFingerprint("user-1", "aabbccdd");
    const b = computeUserFingerprint("user-1", "aabbccdd");
    expect(a).toBe(b);
  });

  it("only contains decimal digits", () => {
    const fp = computeUserFingerprint("user-1", "aabbccdd");
    expect(fp).toMatch(/^[0-9]+$/);
  });

  it("different identity keys produce different fingerprints", () => {
    const a = computeUserFingerprint("user-1", "aabbccdd");
    const b = computeUserFingerprint("user-1", "aabbccde");
    expect(a).not.toBe(b);
  });

  it("different userIds produce different fingerprints for the same key", () => {
    const a = computeUserFingerprint("user-1", "aabbccdd");
    const b = computeUserFingerprint("user-2", "aabbccdd");
    expect(a).not.toBe(b);
  });

  it("does not collapse hash bytes with a-f nibbles into fewer effective digits", () => {
    // Regression for the old bug: parseInt(nibble, 16).toString() emits
    // ONE decimal digit for nibbles 0-9 but TWO for nibbles a-f (10-15),
    // so hex nibble sequences [0xa, 0x1] and [0x1, 0x0, 0x1] both rendered
    // as the literal string "101" — two different underlying byte
    // sequences producing an identical displayed fingerprint. Since we
    // can't force SHA-256 to output a chosen byte pattern, this test
    // instead pins the encoding helper's behavior indirectly: a real
    // fingerprint must be long enough to reflect the full 32-byte hash
    // (16 five-digit groups = 80 digits) rather than being padded out
    // with constant trailing zeros the way the old fixed-length-120,
    // pad-with-"0" scheme was.
    const fp = computeUserFingerprint("user-1", "aabbccdd");
    expect(fp).toHaveLength(80);
  });
});

describe("computeDmSafetyNumber", () => {
  it("is identical regardless of argument order (canonical ordering)", () => {
    const fpAlice = computeUserFingerprint("alice", "alice-key");
    const fpBob = computeUserFingerprint("bob", "bob-key");

    const fromAlice = computeDmSafetyNumber("alice", fpAlice, "bob", fpBob);
    const fromBob = computeDmSafetyNumber("bob", fpBob, "alice", fpAlice);

    expect(fromAlice).toBe(fromBob);
  });

  it("preserves the full combined entropy of both fingerprints (no lossy re-hash)", () => {
    // Regression: the old implementation ran the concatenated fingerprints
    // through a 32-bit non-cryptographic combiner hash before display —
    // collapsing to a ~4.3 billion-value space trivially searchable by an
    // attacker looking for a substitute key that renders the same number.
    // The safety number must instead just be both fingerprints
    // concatenated, so its length scales with the fingerprints' own
    // length rather than being capped by a weak hash's output space.
    const fpAlice = computeUserFingerprint("alice", "alice-key");
    const fpBob = computeUserFingerprint("bob", "bob-key");
    const safetyNumber = computeDmSafetyNumber("alice", fpAlice, "bob", fpBob);

    expect(safetyNumber).toHaveLength(fpAlice.length + fpBob.length);
    expect(safetyNumber).toContain(fpAlice);
    expect(safetyNumber).toContain(fpBob);
  });

  it("changes if either party's identity key changes", () => {
    const fpAlice = computeUserFingerprint("alice", "alice-key");
    const fpBob = computeUserFingerprint("bob", "bob-key");
    const fpBobSubstituted = computeUserFingerprint("bob", "attacker-key");

    const real = computeDmSafetyNumber("alice", fpAlice, "bob", fpBob);
    const substituted = computeDmSafetyNumber(
      "alice",
      fpAlice,
      "bob",
      fpBobSubstituted,
    );

    expect(real).not.toBe(substituted);
  });
});

describe("formatFingerprint", () => {
  it("groups digits into chunks of 4 separated by spaces", () => {
    expect(formatFingerprint("12345678")).toBe("1234 5678");
  });
});

describe("verifyFingerprint", () => {
  it("matches identical fingerprints", () => {
    expect(verifyFingerprint("123", "123")).toBe(true);
  });

  it("rejects different fingerprints", () => {
    expect(verifyFingerprint("123", "456")).toBe(false);
  });
});
