/**
 * Double Ratchet tests — in-memory mock of IndexedDB store.
 *
 * Tests the ratchet state machine: chain step, root step, encryption,
 * decryption, out-of-order messages, and skipped-message-key cache.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import type { RatchetSession } from "./types";

// ── In-memory store mock ────────────────────────────────────────────────

const sessions = new Map<string, RatchetSession>();

vi.mock("./store", () => ({
  getRatchetSession: vi.fn((peerUserId: string) =>
    Promise.resolve(sessions.get(peerUserId) ?? null),
  ),
  setRatchetSession: vi.fn((session: RatchetSession) => {
    sessions.set(session.peerUserId, session);
    return Promise.resolve();
  }),
}));

// Re-import after mock is set up
import {
  initSenderSession,
  initReceiverSession,
  ratchetEncrypt,
  ratchetDecrypt,
} from "./ratchet";
import { generateEphemeralKey, toHex } from "./primitives";

beforeEach(() => {
  sessions.clear();
});

describe("Double Ratchet", () => {
  describe("session initialization", () => {
    it("initSenderSession creates a valid session", async () => {
      const sessionKey = toHex(new Uint8Array(32).fill(0x01));
      await initSenderSession("peer-1", "device-1", sessionKey);

      const session = sessions.get("peer-1");
      expect(session).toBeDefined();
      expect(session!.peerUserId).toBe("peer-1");
      expect(session!.peerDeviceId).toBe("device-1");
      expect(session!.rootKey).toBe(sessionKey);
      expect(session!.sendingChainIndex).toBe(0);
      expect(session!.receivingChainIndex).toBe(0);
      expect(session!.dhPub).toHaveLength(64);
      expect(session!.dhPriv).toHaveLength(64);
    });

    it("initReceiverSession creates a valid session", async () => {
      const sessionKey = toHex(new Uint8Array(32).fill(0x02));
      const alice = generateEphemeralKey();

      await initReceiverSession(
        "alice",
        "device-a",
        sessionKey,
        alice.publicKey,
      );

      const session = sessions.get("alice");
      expect(session).toBeDefined();
      expect(session!.rootKey).toBe(sessionKey);
      expect(session!.sendingChainKey).toBe(sessionKey);
      expect(session!.receivingChainKey).toBe(sessionKey);
      expect(session!.peerDhPub).toBe(alice.publicKey);
    });
  });

  describe("encrypt/decrypt round-trip", () => {
    it("encrypts and decrypts a message in sequence", async () => {
      const sessionKey = toHex(new Uint8Array(32).fill(0x01));
      const peerUserId = "bob";

      // Alice initializes sender session
      await initSenderSession(peerUserId, "device-b", sessionKey);

      // Alice encrypts
      const plaintext = new TextEncoder().encode("hello bob");
      const { ciphertext, nonce, header } = await ratchetEncrypt(
        peerUserId,
        plaintext,
        "alice",
        "bob",
      );

      expect(ciphertext).toBeTruthy();
      expect(nonce).toBeTruthy();
      expect(header.dhPub).toHaveLength(64);
      expect(header.pn).toBe(0);
      expect(header.n).toBe(0);

      // Bob initializes receiver session using Alice's DH public key
      await initReceiverSession("alice", "device-a", sessionKey, header.dhPub);

      // Bob decrypts
      const decrypted = await ratchetDecrypt(
        "alice",
        ciphertext,
        nonce,
        header,
        "alice", // sender
        "bob", // recipient (us)
      );

      expect(new TextDecoder().decode(decrypted)).toBe("hello bob");
    });

    it("handles multiple sequential messages", async () => {
      const sessionKey = toHex(new Uint8Array(32).fill(0x01));

      // Initialize both sides
      await initSenderSession("bob", "device-b", sessionKey);
      const firstHeader = { dhPub: sessions.get("bob")!.dhPub, pn: 0, n: 0 };
      await initReceiverSession(
        "alice",
        "device-a",
        sessionKey,
        firstHeader.dhPub,
      );

      const messages = ["msg-1", "msg-2", "msg-3", "msg-4", "msg-5"];

      for (const msg of messages) {
        const plaintext = new TextEncoder().encode(msg);
        const { ciphertext, nonce, header } = await ratchetEncrypt(
          "bob",
          plaintext,
          "alice",
          "bob",
        );

        const decrypted = await ratchetDecrypt(
          "alice",
          ciphertext,
          nonce,
          header,
          "alice",
          "bob",
        );

        expect(new TextDecoder().decode(decrypted)).toBe(msg);
      }
    });

    it("handles bidirectional messaging", async () => {
      const sessionKey = toHex(new Uint8Array(32).fill(0x01));

      // Alice → Bob first message (X3DH)
      await initSenderSession("bob", "device-b", sessionKey);
      const firstHeader = { dhPub: sessions.get("bob")!.dhPub, pn: 0, n: 0 };
      await initReceiverSession(
        "alice",
        "device-a",
        sessionKey,
        firstHeader.dhPub,
      );

      // Alice sends
      const {
        ciphertext: ct1,
        nonce: n1,
        header: h1,
      } = await ratchetEncrypt(
        "bob",
        new TextEncoder().encode("hello bob"),
        "alice",
        "bob",
      );

      // Bob decrypts
      const pt1 = await ratchetDecrypt("alice", ct1, n1, h1, "alice", "bob");
      expect(new TextDecoder().decode(pt1)).toBe("hello bob");

      // Bob replies
      const {
        ciphertext: ct2,
        nonce: n2,
        header: h2,
      } = await ratchetEncrypt(
        "alice",
        new TextEncoder().encode("hi alice"),
        "bob",
        "alice",
      );

      // Alice decrypts
      const pt2 = await ratchetDecrypt("bob", ct2, n2, h2, "bob", "alice");
      expect(new TextDecoder().decode(pt2)).toBe("hi alice");
    });
  });

  describe("out-of-order messages", () => {
    it("handles messages arriving out of order via skipped-key cache", async () => {
      const sessionKey = toHex(new Uint8Array(32).fill(0x01));

      await initSenderSession("bob", "device-b", sessionKey);
      const firstHeader = { dhPub: sessions.get("bob")!.dhPub, pn: 0, n: 0 };
      await initReceiverSession(
        "alice",
        "device-a",
        sessionKey,
        firstHeader.dhPub,
      );

      // Alice sends 3 messages
      const envelopes = [];
      for (let i = 0; i < 3; i++) {
        const { ciphertext, nonce, header } = await ratchetEncrypt(
          "bob",
          new TextEncoder().encode(`msg-${i}`),
          "alice",
          "bob",
        );
        envelopes.push({ ciphertext, nonce, header });
      }

      // Bob receives in reverse order (out of order)
      const pt2 = await ratchetDecrypt(
        "alice",
        envelopes[2].ciphertext,
        envelopes[2].nonce,
        envelopes[2].header,
        "alice",
        "bob",
      );
      expect(new TextDecoder().decode(pt2)).toBe("msg-2");

      const pt0 = await ratchetDecrypt(
        "alice",
        envelopes[0].ciphertext,
        envelopes[0].nonce,
        envelopes[0].header,
        "alice",
        "bob",
      );
      expect(new TextDecoder().decode(pt0)).toBe("msg-0");

      const pt1 = await ratchetDecrypt(
        "alice",
        envelopes[1].ciphertext,
        envelopes[1].nonce,
        envelopes[1].header,
        "alice",
        "bob",
      );
      expect(new TextDecoder().decode(pt1)).toBe("msg-1");
    });
  });

  describe("error handling", () => {
    it("throws when no session exists for decryption", async () => {
      await expect(
        ratchetDecrypt(
          "unknown-peer",
          "ciphertext",
          "nonce",
          { dhPub: "abc", pn: 0, n: 0 },
          "sender",
          "recipient",
        ),
      ).rejects.toThrow("No ratchet session for peer unknown-peer");
    });

    it("throws when no session exists for encryption", async () => {
      await expect(
        ratchetEncrypt(
          "unknown-peer",
          new Uint8Array(5),
          "sender",
          "recipient",
        ),
      ).rejects.toThrow("No ratchet session for peer unknown-peer");
    });
  });
});
