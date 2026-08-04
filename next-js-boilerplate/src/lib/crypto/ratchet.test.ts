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
  getRatchetSession: vi.fn((_ownUserId: string, peerUserId: string) =>
    Promise.resolve(sessions.get(peerUserId) ?? null),
  ),
  setRatchetSession: vi.fn((_ownUserId: string, session: RatchetSession) => {
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
      const peerSpk = generateEphemeralKey(); // stand-in for peer's signed prekey
      await initSenderSession(
        "self",
        "peer-1",
        "device-1",
        sessionKey,
        peerSpk.publicKey,
      );

      const session = sessions.get("peer-1");
      expect(session).toBeDefined();
      expect(session!.peerUserId).toBe("peer-1");
      expect(session!.peerDeviceId).toBe("device-1");
      expect(session!.sendingChainIndex).toBe(0);
      expect(session!.receivingChainIndex).toBe(0);
      expect(session!.dhPub).toHaveLength(64);
      expect(session!.dhPriv).toHaveLength(64);
      expect(session!.peerDhPub).toBeNull();
      // Receiving chain isn't established until the peer's first reply.
      expect(session!.receivingChainKey).toBeNull();
      // Sending chain must be DH-derived, never the raw X3DH session key —
      // otherwise it would collide with whatever seeds the reverse direction.
      expect(session!.sendingChainKey).not.toBe(sessionKey);
      expect(session!.rootKey).not.toBe(sessionKey);
    });

    it("initReceiverSession creates a valid session", async () => {
      const sessionKey = toHex(new Uint8Array(32).fill(0x02));
      const alice = generateEphemeralKey(); // Alice's ratchet keypair
      const mySpk = generateEphemeralKey(); // Bob's signed-prekey keypair

      await initReceiverSession(
        "bob",
        "alice",
        "device-a",
        sessionKey,
        alice.publicKey,
        mySpk.privateKey,
        mySpk.publicKey,
      );

      const session = sessions.get("alice");
      expect(session).toBeDefined();
      expect(session!.peerDhPub).toBe(alice.publicKey);
      expect(session!.dhPub).toBe(mySpk.publicKey);
      expect(session!.dhPriv).toBe(mySpk.privateKey);
      // Sending chain isn't established until we actually reply.
      expect(session!.sendingChainKey).toBeNull();
      expect(session!.receivingChainKey).not.toBeNull();
      expect(session!.receivingChainKey).not.toBe(sessionKey);
    });

    it("sender and receiver independently derive the same initial chain key", async () => {
      // This is the core X3DH->ratchet handoff: Alice seeds her sending
      // chain from DH(her fresh ratchet key, Bob's SPK); Bob seeds his
      // receiving chain from DH(his SPK, Alice's ratchet key). These must
      // be equal by DH symmetry so Bob can decrypt Alice's first message.
      const sessionKey = toHex(new Uint8Array(32).fill(0x03));
      const bobSpk = generateEphemeralKey();

      await initSenderSession(
        "alice",
        "bob",
        "device-b",
        sessionKey,
        bobSpk.publicKey,
      );
      const aliceSession = sessions.get("bob")!;

      await initReceiverSession(
        "bob",
        "alice",
        "device-a",
        sessionKey,
        aliceSession.dhPub,
        bobSpk.privateKey,
        bobSpk.publicKey,
      );
      const bobSession = sessions.get("alice")!;

      expect(bobSession.receivingChainKey).toBe(aliceSession.sendingChainKey);
      expect(bobSession.rootKey).toBe(aliceSession.rootKey);
    });
  });

  describe("encrypt/decrypt round-trip", () => {
    it("encrypts and decrypts a message in sequence", async () => {
      const sessionKey = toHex(new Uint8Array(32).fill(0x01));
      const peerUserId = "bob";
      const bobSpk = generateEphemeralKey();

      // Alice initializes sender session
      await initSenderSession(
        "alice",
        peerUserId,
        "device-b",
        sessionKey,
        bobSpk.publicKey,
      );

      // Alice encrypts
      const plaintext = new TextEncoder().encode("hello bob");
      const { ciphertext, nonce, header } = await ratchetEncrypt(
        "alice",
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

      // Bob initializes receiver session using his own SPK keypair and
      // Alice's ratchet public key from the message header.
      await initReceiverSession(
        "bob",
        "alice",
        "device-a",
        sessionKey,
        header.dhPub,
        bobSpk.privateKey,
        bobSpk.publicKey,
      );

      // Bob decrypts
      const decrypted = await ratchetDecrypt(
        "bob",
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
      const bobSpk = generateEphemeralKey();

      await initSenderSession(
        "alice",
        "bob",
        "device-b",
        sessionKey,
        bobSpk.publicKey,
      );
      const firstHeader = { dhPub: sessions.get("bob")!.dhPub, pn: 0, n: 0 };
      await initReceiverSession(
        "bob",
        "alice",
        "device-a",
        sessionKey,
        firstHeader.dhPub,
        bobSpk.privateKey,
        bobSpk.publicKey,
      );

      const messages = ["msg-1", "msg-2", "msg-3", "msg-4", "msg-5"];

      for (const msg of messages) {
        const plaintext = new TextEncoder().encode(msg);
        const { ciphertext, nonce, header } = await ratchetEncrypt(
          "alice",
          "bob",
          plaintext,
          "alice",
          "bob",
        );

        const decrypted = await ratchetDecrypt(
          "bob",
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

    it("handles bidirectional messaging with independent, ratcheted per-direction keys", async () => {
      const sessionKey = toHex(new Uint8Array(32).fill(0x01));
      const bobSpk = generateEphemeralKey();

      // Alice -> Bob first message (X3DH)
      await initSenderSession(
        "alice",
        "bob",
        "device-b",
        sessionKey,
        bobSpk.publicKey,
      );
      const aliceSessionBefore = sessions.get("bob")!;
      // Session objects are mutated in place by the ratchet functions, so
      // snapshot the primitive values we compare later rather than holding
      // a reference to the (still-live) session object.
      const aliceRootKeyBefore = aliceSessionBefore.rootKey;
      await initReceiverSession(
        "bob",
        "alice",
        "device-a",
        sessionKey,
        aliceSessionBefore.dhPub,
        bobSpk.privateKey,
        bobSpk.publicKey,
      );

      // Alice sends
      const {
        ciphertext: ct1,
        nonce: n1,
        header: h1,
      } = await ratchetEncrypt(
        "alice",
        "bob",
        new TextEncoder().encode("hello bob"),
        "alice",
        "bob",
      );

      // Bob decrypts
      const pt1 = await ratchetDecrypt(
        "bob",
        "alice",
        ct1,
        n1,
        h1,
        "alice",
        "bob",
      );
      expect(new TextDecoder().decode(pt1)).toBe("hello bob");

      // Bob replies
      const {
        ciphertext: ct2,
        nonce: n2,
        header: h2,
      } = await ratchetEncrypt(
        "bob",
        "alice",
        new TextEncoder().encode("hi alice"),
        "bob",
        "alice",
      );

      // Regression check: Bob's reply must use a DIFFERENT ratchet key than
      // Alice's message — the original bug seeded both directions' chains
      // identically from the raw X3DH key, so the same-index message key
      // was reused across directions.
      expect(h2.dhPub).not.toBe(h1.dhPub);

      // Alice decrypts
      const pt2 = await ratchetDecrypt(
        "alice",
        "bob",
        ct2,
        n2,
        h2,
        "bob",
        "alice",
      );
      expect(new TextDecoder().decode(pt2)).toBe("hi alice");

      // Regression check: Alice must have actually performed a DH-ratchet
      // step on receiving Bob's reply (post-compromise recovery) — the
      // original bug's peerDhPub-starts-falsy guard meant this never fired.
      const aliceSessionAfter = sessions.get("bob")!;
      expect(aliceSessionAfter.rootKey).not.toBe(aliceRootKeyBefore);
      expect(aliceSessionAfter.peerDhPub).toBe(h2.dhPub);

      // Conversation keeps flowing correctly after the ratchet.
      const {
        ciphertext: ct3,
        nonce: n3,
        header: h3,
      } = await ratchetEncrypt(
        "alice",
        "bob",
        new TextEncoder().encode("still there?"),
        "alice",
        "bob",
      );
      const pt3 = await ratchetDecrypt(
        "bob",
        "alice",
        ct3,
        n3,
        h3,
        "alice",
        "bob",
      );
      expect(new TextDecoder().decode(pt3)).toBe("still there?");
    });

    it("recovers a message skipped right before a ratchet, via header.pn", async () => {
      const sessionKey = toHex(new Uint8Array(32).fill(0x01));
      const bobSpk = generateEphemeralKey();

      await initSenderSession(
        "alice",
        "bob",
        "device-b",
        sessionKey,
        bobSpk.publicKey,
      );
      const aliceInitialDh = sessions.get("bob")!.dhPub;
      await initReceiverSession(
        "bob",
        "alice",
        "device-a",
        sessionKey,
        aliceInitialDh,
        bobSpk.privateKey,
        bobSpk.publicKey,
      );

      // Alice sends two messages; only the first reaches Bob right away.
      const envA0 = await ratchetEncrypt(
        "alice",
        "bob",
        new TextEncoder().encode("a0"),
        "alice",
        "bob",
      );
      const envA1 = await ratchetEncrypt(
        "alice",
        "bob",
        new TextEncoder().encode("a1"),
        "alice",
        "bob",
      );
      await ratchetDecrypt(
        "bob",
        "alice",
        envA0.ciphertext,
        envA0.nonce,
        envA0.header,
        "alice",
        "bob",
      );
      // envA1 stays "in flight" — Bob hasn't seen it yet.

      // Bob replies; Alice receiving it invalidates her sending chain.
      const replyB0 = await ratchetEncrypt(
        "bob",
        "alice",
        new TextEncoder().encode("b0"),
        "bob",
        "alice",
      );
      await ratchetDecrypt(
        "alice",
        "bob",
        replyB0.ciphertext,
        replyB0.nonce,
        replyB0.header,
        "bob",
        "alice",
      );

      // Alice's next send re-ratchets (fresh dhPub). Its pn must report
      // that her previous chain (envA0 + envA1) had 2 messages, so Bob can
      // still recover envA1's key before that chain state is discarded.
      const envA2 = await ratchetEncrypt(
        "alice",
        "bob",
        new TextEncoder().encode("a2"),
        "alice",
        "bob",
      );
      expect(envA2.header.pn).toBe(2);
      expect(envA2.header.dhPub).not.toBe(envA0.header.dhPub);

      // Bob receives the ratcheted message first, then the delayed one.
      const decrypted2 = await ratchetDecrypt(
        "bob",
        "alice",
        envA2.ciphertext,
        envA2.nonce,
        envA2.header,
        "alice",
        "bob",
      );
      expect(new TextDecoder().decode(decrypted2)).toBe("a2");

      const decrypted1 = await ratchetDecrypt(
        "bob",
        "alice",
        envA1.ciphertext,
        envA1.nonce,
        envA1.header,
        "alice",
        "bob",
      );
      expect(new TextDecoder().decode(decrypted1)).toBe("a1");
    });
  });

  describe("out-of-order messages", () => {
    it("handles messages arriving out of order via skipped-key cache", async () => {
      const sessionKey = toHex(new Uint8Array(32).fill(0x01));
      const bobSpk = generateEphemeralKey();

      await initSenderSession(
        "alice",
        "bob",
        "device-b",
        sessionKey,
        bobSpk.publicKey,
      );
      const firstHeader = { dhPub: sessions.get("bob")!.dhPub, pn: 0, n: 0 };
      await initReceiverSession(
        "bob",
        "alice",
        "device-a",
        sessionKey,
        firstHeader.dhPub,
        bobSpk.privateKey,
        bobSpk.publicKey,
      );

      // Alice sends 3 messages
      const envelopes = [];
      for (let i = 0; i < 3; i++) {
        const { ciphertext, nonce, header } = await ratchetEncrypt(
          "alice",
          "bob",
          new TextEncoder().encode(`msg-${i}`),
          "alice",
          "bob",
        );
        envelopes.push({ ciphertext, nonce, header });
      }

      // Bob receives in reverse order (out of order)
      const pt2 = await ratchetDecrypt(
        "bob",
        "alice",
        envelopes[2].ciphertext,
        envelopes[2].nonce,
        envelopes[2].header,
        "alice",
        "bob",
      );
      expect(new TextDecoder().decode(pt2)).toBe("msg-2");

      const pt0 = await ratchetDecrypt(
        "bob",
        "alice",
        envelopes[0].ciphertext,
        envelopes[0].nonce,
        envelopes[0].header,
        "alice",
        "bob",
      );
      expect(new TextDecoder().decode(pt0)).toBe("msg-0");

      const pt1 = await ratchetDecrypt(
        "bob",
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
          "self",
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
          "self",
          "unknown-peer",
          new Uint8Array(5),
          "sender",
          "recipient",
        ),
      ).rejects.toThrow("No ratchet session for peer unknown-peer");
    });
  });
});
