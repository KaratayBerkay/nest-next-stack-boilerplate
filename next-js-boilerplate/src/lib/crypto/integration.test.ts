/**
 * Two-party integration test — full X3DH + Double Ratchet round-trip.
 *
 * Verifies that two independent clients (Alice and Bob) can:
 * 1. Generate identity key material
 * 2. Perform X3DH first-contact handshake
 * 3. Exchange encrypted messages via the Double Ratchet
 * 4. Handle out-of-order message delivery
 *
 * All state lives in an in-memory mock of IndexedDB — no real browser
 * or backend needed.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// ── In-memory store ─────────────────────────────────────────────────────

interface StoredIdentity {
  identitySigningKey: string;
  identityAgreementKey: string;
  identityAgreementKeySignature: string;
  deviceId: string;
  createdAt: string;
}

const identities = new Map<string, StoredIdentity>();
const prekeys = new Map<string, unknown>();
const sessions = new Map<string, unknown>();
const safetyNumbers = new Map<string, string>();

vi.mock("./store", () => ({
  getIdentity: vi.fn(() => Promise.resolve(identities.get("current") ?? null)),
  setIdentity: vi.fn((id: StoredIdentity) => {
    identities.set("current", id);
    return Promise.resolve();
  }),
  getSignedPrekey: vi.fn((_keyId: number) => {
    return Promise.resolve(prekeys.get(`spk-${_keyId}`) ?? null);
  }),
  setSignedPrekey: vi.fn((_keyId: number, spk: unknown) => {
    prekeys.set(`spk-${_keyId}`, spk);
    return Promise.resolve();
  }),
  getOneTimePrekey: vi.fn((_keyId: string) => {
    return Promise.resolve(prekeys.get(`otpk-${_keyId}`) ?? null);
  }),
  setOneTimePrekey: vi.fn((_keyId: string, opk: unknown) => {
    prekeys.set(`otpk-${_keyId}`, opk);
    return Promise.resolve();
  }),
  deleteOneTimePrekey: vi.fn((_keyId: string) => {
    prekeys.delete(`otpk-${_keyId}`);
    return Promise.resolve();
  }),
  getRatchetSession: vi.fn((peerUserId: string) => {
    return Promise.resolve(sessions.get(peerUserId) ?? null);
  }),
  setRatchetSession: vi.fn((session: { peerUserId: string }) => {
    sessions.set(session.peerUserId, session);
    return Promise.resolve();
  }),
  getSafetyNumber: vi.fn((peerUserId: string) => {
    return Promise.resolve(safetyNumbers.get(peerUserId) ?? null);
  }),
  setSafetyNumber: vi.fn((peerUserId: string, fp: string) => {
    safetyNumbers.set(peerUserId, fp);
    return Promise.resolve();
  }),
}));

// Re-import after mock
import {
  generateIdentitySigningKey,
  generateIdentityAgreementKey,
  generateEphemeralKey,
  ed25519Sign,
  generateSignedPrekey,
  generateOneTimePrekeys,
} from "./primitives";
import type { DeviceIdentity, DeviceBundle, MessagePlaintextV1 } from "./types";
import { x3dhInitiate, x3dhRespond } from "./x3dh";
import {
  initSenderSession,
  initReceiverSession,
  ratchetEncrypt,
  ratchetDecrypt,
} from "./ratchet";
import { getRatchetSession } from "./store";

// ── Helper: generate a full device identity + bundle ────────────────────

function generateDeviceIdentity(deviceId: string) {
  const ikSig = generateIdentitySigningKey();
  const ikDh = generateIdentityAgreementKey();
  const ikDhSig = ed25519Sign(ikSig.privateKey, hexToBytes(ikDh.publicKey));

  const identity: DeviceIdentity = {
    v: 1,
    deviceId,
    identitySigningKey: ikSig.publicKey,
    identityAgreementKey: ikDh.publicKey,
    identityAgreementKeySignature: ikDhSig,
    createdAt: new Date().toISOString(),
  };

  const spk = generateSignedPrekey(ikSig.privateKey);

  const opks = generateOneTimePrekeys(5);

  const bundle: DeviceBundle = {
    identitySigningKey: ikSig.publicKey,
    identityAgreementKey: ikDh.publicKey,
    identityAgreementKeySignature: ikDhSig,
    signedPrekey: spk.publicKey,
    signedPrekeySignature: spk.signature,
    signedPrekeyId: 0,
    algVersion: 1,
  };

  return {
    identity,
    signingPrivateKey: ikSig.privateKey,
    agreementPrivateKey: ikDh.privateKey,
    spkPrivateKey: spk.privateKey,
    bundle,
    opks,
  };
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

// ── Tests ───────────────────────────────────────────────────────────────

describe("Two-party E2EE integration", () => {
  let alice: ReturnType<typeof generateDeviceIdentity>;
  let bob: ReturnType<typeof generateDeviceIdentity>;

  beforeEach(() => {
    identities.clear();
    prekeys.clear();
    sessions.clear();
    safetyNumbers.clear();

    alice = generateDeviceIdentity("alice-device-1");
    bob = generateDeviceIdentity("bob-device-1");
  });

  it("full round-trip: X3DH + ratchet + encrypt/decrypt", async () => {
    // ── Step 1: Alice performs X3DH with Bob's bundle ──
    const ephemeral = {
      privateKey: generateIdentityAgreementKey().privateKey, // reuse for simplicity
      publicKey: "",
    };
    // Generate proper ephemeral
    const eph = generateIdentityAgreementKey();
    ephemeral.privateKey = eph.privateKey;
    ephemeral.publicKey = eph.publicKey;

    const { sessionKey, init } = x3dhInitiate(
      {
        publicKey: alice.identity.identityAgreementKey,
        privateKey: alice.agreementPrivateKey,
      },
      bob.bundle,
      ephemeral,
      bob.opks[0],
    );

    expect(sessionKey).toHaveLength(64);
    expect(init.identityKey).toBe(alice.identity.identityAgreementKey);
    expect(init.ephemeralKey).toHaveLength(64);

    // ── Step 2: Bob responds to X3DH ──
    const bobSessionKey = x3dhRespond({
      identitySigningPrivateKey: alice.identity.identitySigningKey, // not used for DH
      identityAgreementPrivateKey: bob.agreementPrivateKey,
      signedPrekeyPrivateKey: bob.spkPrivateKey,
      oneTimePrekeyPrivateKey: bob.opks[0].privateKey,
      init,
    });

    expect(bobSessionKey).toBe(sessionKey);

    // ── Step 3: Initialize ratchet sessions ──
    // Alice initializes sender session — her sending chain is seeded via a
    // real DH against Bob's signed prekey (already used in X3DH above).
    await initSenderSession(
      "bob",
      "bob-device-1",
      sessionKey,
      bob.bundle.signedPrekey,
    );

    // Bob initializes receiver session using Alice's ratchet DH public key
    // (In production, Bob gets this from Alice's first message header;
    //  for the test, we read it directly from the session store.) and his
    // own signed-prekey keypair (mirrors Alice's derivation by DH symmetry).
    const aliceSession = await getRatchetSession("bob");
    const aliceRatchetDhPub = (aliceSession as { dhPub: string }).dhPub;

    await initReceiverSession(
      "alice",
      "alice-device-1",
      sessionKey,
      aliceRatchetDhPub,
      bob.spkPrivateKey,
      bob.bundle.signedPrekey,
    );

    // ── Step 4: Alice sends first message ──
    const plaintext1: MessagePlaintextV1 = { text: "Hello Bob!" };
    const plaintext1Bytes = new TextEncoder().encode(
      JSON.stringify(plaintext1),
    );

    const {
      ciphertext: ct1,
      nonce: n1,
      header: h1,
    } = await ratchetEncrypt(
      "bob",
      plaintext1Bytes,
      "alice-device-1",
      "bob-device-1",
    );

    expect(ct1).toBeTruthy();
    expect(n1).toBeTruthy();
    expect(h1.dhPub).toHaveLength(64);

    // ── Step 5: Bob decrypts first message ──
    const decrypted1 = await ratchetDecrypt(
      "alice",
      ct1,
      n1,
      h1,
      "alice-device-1",
      "bob-device-1",
    );

    const result1: MessagePlaintextV1 = JSON.parse(
      new TextDecoder().decode(decrypted1),
    );
    expect(result1.text).toBe("Hello Bob!");

    // ── Step 6: Bob replies ──
    const plaintext2: MessagePlaintextV1 = { text: "Hi Alice!" };
    const plaintext2Bytes = new TextEncoder().encode(
      JSON.stringify(plaintext2),
    );

    const {
      ciphertext: ct2,
      nonce: n2,
      header: h2,
    } = await ratchetEncrypt(
      "alice",
      plaintext2Bytes,
      "bob-device-1",
      "alice-device-1",
    );

    // ── Step 7: Alice decrypts Bob's reply ──
    const decrypted2 = await ratchetDecrypt(
      "bob",
      ct2,
      n2,
      h2,
      "bob-device-1",
      "alice-device-1",
    );

    const result2: MessagePlaintextV1 = JSON.parse(
      new TextDecoder().decode(decrypted2),
    );
    expect(result2.text).toBe("Hi Alice!");

    // ── Step 8: Multiple messages back and forth (step-by-step) ──
    const messages = [
      { from: "alice", text: "msg-1", toPeer: "bob", toDevice: "bob-device-1" },
      {
        from: "bob",
        text: "msg-2",
        toPeer: "alice",
        toDevice: "alice-device-1",
      },
      { from: "alice", text: "msg-3", toPeer: "bob", toDevice: "bob-device-1" },
      {
        from: "bob",
        text: "msg-4",
        toPeer: "alice",
        toDevice: "alice-device-1",
      },
      { from: "alice", text: "msg-5", toPeer: "bob", toDevice: "bob-device-1" },
    ];

    for (const msg of messages) {
      const pt: MessagePlaintextV1 = { text: msg.text };
      const ptBytes = new TextEncoder().encode(JSON.stringify(pt));

      const fromDevice =
        msg.from === "alice" ? "alice-device-1" : "bob-device-1";

      // The decryptor's session is keyed by the sender's userId
      const decryptSessionPeer = msg.from;
      const { ciphertext, nonce, header } = await ratchetEncrypt(
        msg.toPeer,
        ptBytes,
        fromDevice,
        msg.toDevice,
      );

      const decrypted = await ratchetDecrypt(
        decryptSessionPeer,
        ciphertext,
        nonce,
        header,
        fromDevice,
        msg.toDevice,
      );

      const result: MessagePlaintextV1 = JSON.parse(
        new TextDecoder().decode(decrypted),
      );
      expect(result.text).toBe(msg.text);
    }
  });

  it("handles out-of-order messages", async () => {
    // Set up session (simplified — just init sender for 'bob')
    const sessionKey = "0".repeat(64); // dummy session key for testing
    const bobSpk = generateEphemeralKey();
    await initSenderSession(
      "bob",
      "bob-device-1",
      sessionKey,
      bobSpk.publicKey,
    );

    // Encrypt 3 messages from Alice to Bob
    const envelopes = [];
    for (let i = 0; i < 3; i++) {
      const pt: MessagePlaintextV1 = { text: `msg-${i}` };
      const ptBytes = new TextEncoder().encode(JSON.stringify(pt));
      const env = await ratchetEncrypt(
        "bob",
        ptBytes,
        "alice-device-1",
        "bob-device-1",
      );
      envelopes.push(env);
    }

    // Initialize receiver with the same session key
    await initReceiverSession(
      "alice",
      "alice-device-1",
      sessionKey,
      envelopes[0].header.dhPub,
      bobSpk.privateKey,
      bobSpk.publicKey,
    );

    // Receive in reverse order: msg-2, msg-0, msg-1
    const pt2 = await ratchetDecrypt(
      "alice",
      envelopes[2].ciphertext,
      envelopes[2].nonce,
      envelopes[2].header,
      "alice-device-1",
      "bob-device-1",
    );
    expect(JSON.parse(new TextDecoder().decode(pt2)).text).toBe("msg-2");

    const pt0 = await ratchetDecrypt(
      "alice",
      envelopes[0].ciphertext,
      envelopes[0].nonce,
      envelopes[0].header,
      "alice-device-1",
      "bob-device-1",
    );
    expect(JSON.parse(new TextDecoder().decode(pt0)).text).toBe("msg-0");

    const pt1 = await ratchetDecrypt(
      "alice",
      envelopes[1].ciphertext,
      envelopes[1].nonce,
      envelopes[1].header,
      "alice-device-1",
      "bob-device-1",
    );
    expect(JSON.parse(new TextDecoder().decode(pt1)).text).toBe("msg-1");
  });

  it("rejects decryption with wrong AAD", async () => {
    const sessionKey = "0".repeat(64);
    const bobSpk = generateEphemeralKey();
    await initSenderSession(
      "bob",
      "bob-device-1",
      sessionKey,
      bobSpk.publicKey,
    );

    const pt: MessagePlaintextV1 = { text: "secret" };
    const ptBytes = new TextEncoder().encode(JSON.stringify(pt));

    const { ciphertext, nonce, header } = await ratchetEncrypt(
      "bob",
      ptBytes,
      "alice-device-1",
      "bob-device-1",
    );

    // Initialize receiver with correct session
    await initReceiverSession(
      "alice",
      "alice-device-1",
      sessionKey,
      header.dhPub,
      bobSpk.privateKey,
      bobSpk.publicKey,
    );

    // Try to decrypt with wrong sender/recipient IDs (wrong AAD)
    await expect(
      ratchetDecrypt(
        "alice",
        ciphertext,
        nonce,
        header,
        "wrong-sender", // wrong AAD
        "bob-device-1",
      ),
    ).rejects.toThrow();
  });

  it("round-trips through the real encryptDmMessage/decryptDmMessage glue (not just raw ratchet calls)", async () => {
    // This exercises envelope.ts directly — the production code path that
    // wires X3DH + the ratchet together. Every other test in this file
    // calls initSenderSession/initReceiverSession/ratchetEncrypt/
    // ratchetDecrypt directly with manually-supplied correct values, which
    // is exactly how a real bug in the glue code (envelope.ts previously
    // passed the X3DH ephemeral key instead of the message header's actual
    // ratchet key into initReceiverSession — two different keys) could hide
    // behind a fully green suite.
    const { encryptDmMessage, decryptDmMessage } = await import("./envelope");
    const { setOneTimePrekey } = await import("./store");

    // Register Bob's claimed one-time-prekey under its real id, exactly as
    // it would exist in his local IndexedDB before it was ever claimed.
    await setOneTimePrekey(bob.opks[0].keyId, bob.opks[0]);

    const { envelope } = await encryptDmMessage(
      { text: "hello via envelope" },
      {
        identity: alice.identity,
        signingPrivateKey: alice.signingPrivateKey,
        agreementPrivateKey: alice.agreementPrivateKey,
      },
      bob.bundle,
      "bob",
      bob.opks[0],
    );

    // The real (not fabricated) claimed-prekey id must ride along so the
    // responder can look up the matching private half and compute dh4.
    expect(envelope.x3dhInit?.usedOneTimePrekeyId).toBe(bob.opks[0].keyId);

    const { plaintext, wasHandshake } = await decryptDmMessage(
      envelope,
      {
        signingPrivateKey: bob.signingPrivateKey,
        agreementPrivateKey: bob.agreementPrivateKey,
        signedPrekeyPrivateKey: bob.spkPrivateKey,
        signedPrekeyPublicKey: bob.bundle.signedPrekey,
      },
      "alice",
      "bob",
    );

    expect(wasHandshake).toBe(true);
    expect(plaintext.text).toBe("hello via envelope");

    // A follow-up message needs no X3DH preamble and must still decrypt via
    // the now-established ratchet session.
    const { envelope: envelope2 } = await encryptDmMessage(
      { text: "second message" },
      {
        identity: alice.identity,
        signingPrivateKey: alice.signingPrivateKey,
        agreementPrivateKey: alice.agreementPrivateKey,
      },
      bob.bundle,
      "bob",
    );
    expect(envelope2.x3dhInit).toBeUndefined();

    const { plaintext: plaintext2 } = await decryptDmMessage(
      envelope2,
      {
        signingPrivateKey: bob.signingPrivateKey,
        agreementPrivateKey: bob.agreementPrivateKey,
        signedPrekeyPrivateKey: bob.spkPrivateKey,
        signedPrekeyPublicKey: bob.bundle.signedPrekey,
      },
      "alice",
      "bob",
    );
    expect(plaintext2.text).toBe("second message");
  });

  it("re-viewing an old first-message envelope (history reload, pagination) does not corrupt the live session", async () => {
    // The very first message of a conversation permanently carries
    // x3dhInit in its stored envelope. Re-fetching/re-rendering history —
    // pagination, a cache refetch, a page reload — decrypts it again. If
    // decryptDmMessage naively re-bootstraps (re-runs X3DH +
    // initReceiverSession) every time it sees x3dhInit, it silently rolls
    // back the receiver's already-advanced ratchet session, breaking every
    // message after it — no attacker required, just normal history
    // browsing. This must be a no-op once a session already exists.
    const { encryptDmMessage, decryptDmMessage } = await import("./envelope");
    const { setOneTimePrekey } = await import("./store");
    await setOneTimePrekey(bob.opks[0].keyId, bob.opks[0]);

    const bobIdentity = {
      signingPrivateKey: bob.signingPrivateKey,
      agreementPrivateKey: bob.agreementPrivateKey,
      signedPrekeyPrivateKey: bob.spkPrivateKey,
      signedPrekeyPublicKey: bob.bundle.signedPrekey,
    };
    const aliceIdentity = {
      identity: alice.identity,
      signingPrivateKey: alice.signingPrivateKey,
      agreementPrivateKey: alice.agreementPrivateKey,
    };

    // Message 1 (the handshake) — Bob bootstraps his session.
    const { envelope: firstEnvelope } = await encryptDmMessage(
      { text: "hi" },
      aliceIdentity,
      bob.bundle,
      "bob",
      bob.opks[0],
    );
    await decryptDmMessage(firstEnvelope, bobIdentity, "alice", "bob");

    // A reply and another message advance Bob's session well past epoch 0.
    const { envelope: replyEnvelope } = await encryptDmMessage(
      { text: "reply" },
      {
        identity: bob.identity,
        signingPrivateKey: bob.signingPrivateKey,
        agreementPrivateKey: bob.agreementPrivateKey,
      },
      alice.bundle,
      "alice",
    );
    await decryptDmMessage(
      replyEnvelope,
      {
        signingPrivateKey: alice.signingPrivateKey,
        agreementPrivateKey: alice.agreementPrivateKey,
        signedPrekeyPrivateKey: alice.spkPrivateKey,
        signedPrekeyPublicKey: alice.bundle.signedPrekey,
      },
      "bob",
      "alice",
    );
    const { envelope: secondEnvelope } = await encryptDmMessage(
      { text: "second" },
      aliceIdentity,
      bob.bundle,
      "bob",
    );
    await decryptDmMessage(secondEnvelope, bobIdentity, "alice", "bob");

    // Simulate re-viewing history: decrypt the ORIGINAL first envelope
    // again. It's fine if this particular (already-consumed) message fails
    // to decrypt — what matters is that it must not reset Bob's session.
    await decryptDmMessage(firstEnvelope, bobIdentity, "alice", "bob").catch(
      () => undefined,
    );

    // A brand-new message must still decrypt correctly after the replay —
    // proving the live session survived untouched.
    const { envelope: thirdEnvelope } = await encryptDmMessage(
      { text: "still working after replay" },
      aliceIdentity,
      bob.bundle,
      "bob",
    );
    const { plaintext: thirdPlaintext } = await decryptDmMessage(
      thirdEnvelope,
      bobIdentity,
      "alice",
      "bob",
    );
    expect(thirdPlaintext.text).toBe("still working after replay");
  });
});
