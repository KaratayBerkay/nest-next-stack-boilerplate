/**
 * Known-answer and consistency tests for crypto primitives.
 *
 * Fixed private keys → deterministic public keys.
 * Chain step and root step are deterministic given the same inputs.
 * Encrypt/decrypt round-trips for XChaCha20-Poly1305.
 */

import { describe, it, expect } from "vitest";
import {
  generateIdentitySigningKey,
  generateIdentityAgreementKey,
  ed25519Sign,
  ed25519Verify,
  generateSignedPrekey,
  generateOneTimePrekeys,
  x25519SharedSecret,
  generateEphemeralKey,
  hkdfDerive,
  x3dhDeriveSessionKey,
  chainStep,
  rootStep,
  xchachaEncrypt,
  xchachaDecrypt,
  buildAad,
  computeFingerprint,
  toHex,
  fromHex,
} from "./primitives";

// ── Deterministic key generation ────────────────────────────────────────

describe("primitives", () => {
  describe("identity key generation", () => {
    it("generates unique signing keys each call", () => {
      const a = generateIdentitySigningKey();
      const b = generateIdentitySigningKey();
      expect(a.privateKey).not.toBe(b.privateKey);
      expect(a.publicKey).not.toBe(b.publicKey);
      expect(a.privateKey).toHaveLength(64); // 32 bytes hex
      expect(a.publicKey).toHaveLength(64);
    });

    it("generates unique agreement keys each call", () => {
      const a = generateIdentityAgreementKey();
      const b = generateIdentityAgreementKey();
      expect(a.privateKey).not.toBe(b.privateKey);
      expect(a.publicKey).not.toBe(b.publicKey);
    });
  });

  describe("Ed25519 signing", () => {
    it("signs and verifies correctly", () => {
      const keys = generateIdentitySigningKey();
      const message = new TextEncoder().encode("hello e2ee");
      const sig = ed25519Sign(keys.privateKey, message);
      expect(sig).toHaveLength(128); // 64 bytes hex
      expect(ed25519Verify(keys.publicKey, sig, message)).toBe(true);
    });

    it("rejects tampered messages", () => {
      const keys = generateIdentitySigningKey();
      const message = new TextEncoder().encode("original");
      const sig = ed25519Sign(keys.privateKey, message);
      const tampered = new TextEncoder().encode("tampered");
      expect(ed25519Verify(keys.publicKey, sig, tampered)).toBe(false);
    });

    it("rejects wrong public key", () => {
      const keys = generateIdentitySigningKey();
      const otherKeys = generateIdentitySigningKey();
      const message = new TextEncoder().encode("test");
      const sig = ed25519Sign(keys.privateKey, message);
      expect(ed25519Verify(otherKeys.publicKey, sig, message)).toBe(false);
    });
  });

  describe("signed prekey generation", () => {
    it("produces a valid signature over the public key", () => {
      const identity = generateIdentitySigningKey();
      const spk = generateSignedPrekey(identity.privateKey);

      expect(spk.privateKey).toHaveLength(64);
      expect(spk.publicKey).toHaveLength(64);
      expect(spk.signature).toHaveLength(128);

      // Verify the signature is over the SPK public key
      const pubBytes = fromHex(spk.publicKey);
      expect(ed25519Verify(identity.publicKey, spk.signature, pubBytes)).toBe(
        true,
      );
    });
  });

  describe("one-time prekey generation", () => {
    it("generates the requested count", () => {
      const opks = generateOneTimePrekeys(5);
      expect(opks).toHaveLength(5);
      for (const opk of opks) {
        expect(opk.keyId).toMatch(/^otpk-/);
        expect(opk.publicKey).toHaveLength(64);
        expect(opk.privateKey).toHaveLength(64);
      }
    });

    it("generates unique keys each time", () => {
      const a = generateOneTimePrekeys(3);
      const b = generateOneTimePrekeys(3);
      const pubKeys = new Set([
        ...a.map((k) => k.publicKey),
        ...b.map((k) => k.publicKey),
      ]);
      expect(pubKeys.size).toBe(6);
    });
  });

  describe("X25519 shared secret", () => {
    it("produces the same shared secret from both sides", () => {
      const alice = generateEphemeralKey();
      const bob = generateEphemeralKey();

      const shared1 = x25519SharedSecret(alice.privateKey, bob.publicKey);
      const shared2 = x25519SharedSecret(bob.privateKey, alice.publicKey);

      expect(shared1).toBe(shared2);
      expect(shared1).toHaveLength(64); // 32 bytes hex
    });

    it("different key pairs produce different shared secrets", () => {
      const alice = generateEphemeralKey();
      const bob1 = generateEphemeralKey();
      const bob2 = generateEphemeralKey();

      const s1 = x25519SharedSecret(alice.privateKey, bob1.publicKey);
      const s2 = x25519SharedSecret(alice.privateKey, bob2.publicKey);

      expect(s1).not.toBe(s2);
    });
  });

  describe("HKDF-SHA256", () => {
    it("produces deterministic output", () => {
      const ikm = new Uint8Array(32).fill(0x01);
      const salt = new Uint8Array(32).fill(0x02);
      const a = hkdfDerive(ikm, salt, "test-info", 32);
      const b = hkdfDerive(ikm, salt, "test-info", 32);
      expect(a).toBe(b);
      expect(a).toHaveLength(64);
    });

    it("different info strings produce different outputs", () => {
      const ikm = new Uint8Array(32).fill(0x01);
      const salt = new Uint8Array(32).fill(0x02);
      const a = hkdfDerive(ikm, salt, "info-a", 32);
      const b = hkdfDerive(ikm, salt, "info-b", 32);
      expect(a).not.toBe(b);
    });

    it("supports variable output lengths", () => {
      const ikm = new Uint8Array(32).fill(0x01);
      const salt = new Uint8Array(32).fill(0x02);
      const short = hkdfDerive(ikm, salt, "test", 16);
      const long = hkdfDerive(ikm, salt, "test", 64);
      expect(short).toHaveLength(32);
      expect(long).toHaveLength(128);
    });
  });

  describe("X3DH session key derivation", () => {
    it("is deterministic with same inputs", () => {
      const dh1 = toHex(new Uint8Array(32).fill(0x0a));
      const dh2 = toHex(new Uint8Array(32).fill(0x0b));
      const dh3 = toHex(new Uint8Array(32).fill(0x0c));
      const dh4 = toHex(new Uint8Array(32).fill(0x0d));

      const a = x3dhDeriveSessionKey(dh1, dh2, dh3, dh4);
      const b = x3dhDeriveSessionKey(dh1, dh2, dh3, dh4);
      expect(a).toBe(b);
      expect(a).toHaveLength(64);
    });

    it("with and without OPK produces different keys", () => {
      const dh1 = toHex(new Uint8Array(32).fill(0x0a));
      const dh2 = toHex(new Uint8Array(32).fill(0x0b));
      const dh3 = toHex(new Uint8Array(32).fill(0x0c));
      const dh4 = toHex(new Uint8Array(32).fill(0x0d));

      const withOpk = x3dhDeriveSessionKey(dh1, dh2, dh3, dh4);
      const withoutOpk = x3dhDeriveSessionKey(dh1, dh2, dh3);
      expect(withOpk).not.toBe(withoutOpk);
    });
  });

  describe("chain ratchet step", () => {
    it("is deterministic", () => {
      const ck = toHex(new Uint8Array(32).fill(0xff));
      const a = chainStep(ck);
      const b = chainStep(ck);
      expect(a.messageKey).toBe(b.messageKey);
      expect(a.nextChainKey).toBe(b.nextChainKey);
    });

    it("produces different messageKey and nextChainKey", () => {
      const ck = toHex(new Uint8Array(32).fill(0xff));
      const result = chainStep(ck);
      expect(result.messageKey).not.toBe(result.nextChainKey);
    });

    it("chained steps produce different keys each time", () => {
      const ck = toHex(new Uint8Array(32).fill(0xff));
      const step1 = chainStep(ck);
      const step2 = chainStep(step1.nextChainKey);
      expect(step1.messageKey).not.toBe(step2.messageKey);
      expect(step1.nextChainKey).not.toBe(step2.nextChainKey);
    });
  });

  describe("root ratchet step", () => {
    it("is deterministic", () => {
      const rk = toHex(new Uint8Array(32).fill(0xaa));
      const dh = toHex(new Uint8Array(32).fill(0xbb));
      const a = rootStep(rk, dh);
      const b = rootStep(rk, dh);
      expect(a.rootKey).toBe(b.rootKey);
      expect(a.chainKey).toBe(b.chainKey);
    });

    it("produces different rootKey and chainKey", () => {
      const rk = toHex(new Uint8Array(32).fill(0xaa));
      const dh = toHex(new Uint8Array(32).fill(0xbb));
      const result = rootStep(rk, dh);
      expect(result.rootKey).not.toBe(result.chainKey);
    });
  });

  describe("XChaCha20-Poly1305", () => {
    it("encrypts and decrypts round-trip", () => {
      const key = toHex(new Uint8Array(32).fill(0x42));
      const plaintext = new TextEncoder().encode("hello encrypted world");

      const { ciphertext, nonce } = xchachaEncrypt(key, plaintext);
      const decrypted = xchachaDecrypt(key, ciphertext, nonce);

      expect(new TextDecoder().decode(decrypted)).toBe("hello encrypted world");
    });

    it("fails to decrypt with wrong key", () => {
      const key1 = toHex(new Uint8Array(32).fill(0x42));
      const key2 = toHex(new Uint8Array(32).fill(0x43));
      const plaintext = new TextEncoder().encode("secret");

      const { ciphertext, nonce } = xchachaEncrypt(key1, plaintext);

      expect(() => xchachaDecrypt(key2, ciphertext, nonce)).toThrow();
    });

    it("fails to decrypt with tampered ciphertext", () => {
      const key = toHex(new Uint8Array(32).fill(0x42));
      const plaintext = new TextEncoder().encode("secret");

      const { ciphertext, nonce } = xchachaEncrypt(key, plaintext);
      const tampered = ciphertext.slice(0, -2) + "00";

      expect(() => xchachaDecrypt(key, tampered, nonce)).toThrow();
    });

    it("each encryption produces a different nonce", () => {
      const key = toHex(new Uint8Array(32).fill(0x42));
      const plaintext = new TextEncoder().encode("same message");

      const a = xchachaEncrypt(key, plaintext);
      const b = xchachaEncrypt(key, plaintext);

      expect(a.nonce).not.toBe(b.nonce);
      // Ciphertexts differ too because nonces differ
      expect(a.ciphertext).not.toBe(b.ciphertext);
    });

    it("works with AAD", () => {
      const key = toHex(new Uint8Array(32).fill(0x42));
      const plaintext = new TextEncoder().encode("with aad");
      const aad = new TextEncoder().encode("additional data");

      const { ciphertext, nonce } = xchachaEncrypt(key, plaintext, aad);
      const decrypted = xchachaDecrypt(key, ciphertext, nonce, aad);
      expect(new TextDecoder().decode(decrypted)).toBe("with aad");
    });

    it("fails with wrong AAD", () => {
      const key = toHex(new Uint8Array(32).fill(0x42));
      const plaintext = new TextEncoder().encode("with aad");
      const aad1 = new TextEncoder().encode("data-a");
      const aad2 = new TextEncoder().encode("data-b");

      const { ciphertext, nonce } = xchachaEncrypt(key, plaintext, aad1);
      expect(() => xchachaDecrypt(key, ciphertext, nonce, aad2)).toThrow();
    });
  });

  describe("AAD construction", () => {
    it("produces consistent output", () => {
      const aad = buildAad("user-1", "user-2", 1);
      const expected = new TextEncoder().encode("user-1|user-2|1");
      expect(aad).toEqual(expected);
    });
  });

  describe("fingerprint", () => {
    it("produces consistent SHA-256 output", () => {
      const fp1 = computeFingerprint("user-123", "abcdef");
      const fp2 = computeFingerprint("user-123", "abcdef");
      expect(fp1).toBe(fp2);
      expect(fp1).toHaveLength(64);
    });

    it("different inputs produce different fingerprints", () => {
      const a = computeFingerprint("user-1", "key-a");
      const b = computeFingerprint("user-1", "key-b");
      const c = computeFingerprint("user-2", "key-a");
      expect(a).not.toBe(b);
      expect(a).not.toBe(c);
    });
  });
});
