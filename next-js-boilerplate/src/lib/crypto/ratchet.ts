/**
 * Double Ratchet implementation (§1.4 of the plan).
 *
 * Symmetric-key ratchet (chain step) + DH-ratchet step on direction change.
 * Provides forward secrecy + post-compromise recovery for DM sessions.
 *
 * Each direction's chain is seeded via a real X25519 DH output mixed through
 * the root key (rootStep), never by reusing the raw X3DH session key
 * directly as both the sending AND receiving chain — that would make
 * Alice's k-th sent message and Bob's k-th sent message share the identical
 * key. Concretely:
 *   - The initiator's sending chain is seeded from DH(their fresh ratchet
 *     key, the peer's signed prekey) — the peer already knows this pairing
 *     from X3DH, so no extra round trip is needed to bootstrap message 0.
 *   - The responder's receiving chain is seeded from the mirrored DH
 *     (their signed prekey, the initiator's ratchet key) — identical value
 *     by DH symmetry, so both sides derive the same chain independently.
 *   - A side's OWN sending chain is otherwise only ever (re-)established
 *     lazily, right before it actually sends, via a fresh DH-ratchet against
 *     the peer's most-recently-seen ratchet key. It is never copied from a
 *     receiving-chain derivation, which is what previously made the two
 *     directions collide.
 *
 * Skipped-message-key cache is mandatory: this app's delivery (WS + Redis
 * pub/sub + REST fallback) can reorder messages.  A bounded map of
 * derived-but-unused message keys per peer (~200 cap, evict oldest) prevents
 * out-of-order arrivals from desynchronizing the ratchet.
 */

import {
  chainStep,
  rootStep,
  x25519SharedSecret,
  generateEphemeralKey,
  xchachaEncrypt,
  xchachaDecrypt,
  buildAad,
} from "./primitives";
import { getRatchetSession, setRatchetSession } from "./store";
import type { RatchetSession, RatchetHeader } from "./types";

// ── Constants ───────────────────────────────────────────────────────────

const ALG_VERSION = 1;
const MAX_SKIPPED_KEYS = 200;

// ── Public API ──────────────────────────────────────────────────────────

/**
 * Initialize a new sending ratchet session after X3DH completes.
 *
 * The initiator (Alice) calls this after x3dhInitiate() to create the
 * first outbound ratchet session. Her sending chain is seeded via a real
 * DH between a fresh ratchet keypair and the peer's signed prekey — the
 * same pairing Bob mirrors in initReceiverSession, so both sides land on
 * the same chain key without an extra round trip. Her receiving chain
 * stays unset (null) until Bob's first reply triggers a DH-ratchet step.
 */
export async function initSenderSession(
  ownUserId: string,
  peerUserId: string,
  peerDeviceId: string,
  sessionKey: string,
  peerSignedPrekeyPublicKey: string,
): Promise<void> {
  const dh = generateEphemeralKey();
  const dhOutput = x25519SharedSecret(dh.privateKey, peerSignedPrekeyPublicKey);
  const { rootKey, chainKey } = rootStep(sessionKey, dhOutput);

  const session: RatchetSession = {
    peerUserId,
    peerDeviceId,
    rootKey,
    sendingChainKey: chainKey,
    receivingChainKey: null, // unknown until the peer's first reply ratchets us
    dhPub: dh.publicKey,
    dhPriv: dh.privateKey,
    peerDhPub: null, // unknown until first reply
    sendingChainIndex: 0,
    previousSendingChainLength: 0,
    receivingChainIndex: 0,
    receivingChainCount: 0,
    skippedMessageKeys: {},
    updatedAt: new Date().toISOString(),
  };

  await setRatchetSession(ownUserId, session);
}

/**
 * Initialize a receiver ratchet session from Alice's X3DH first message.
 *
 * Bob calls this after x3dhRespond() to set up his side of the ratchet.
 * His receiving chain is seeded via DH(his signed-prekey private key,
 * Alice's ratchet public key) — mirrors initSenderSession's derivation by
 * DH symmetry, so it lands on the identical chain key Alice used to
 * encrypt her first message. His OWN sending chain is left unset (null):
 * it is only established lazily, the moment he actually sends a reply
 * (see ratchetEncrypt), via a freshly generated ratchet keypair — never by
 * copying the receiving chain.
 */
export async function initReceiverSession(
  ownUserId: string,
  peerUserId: string,
  peerDeviceId: string,
  sessionKey: string,
  aliceRatchetDhPub: string,
  mySignedPrekeyPrivateKey: string,
  mySignedPrekeyPublicKey: string,
): Promise<void> {
  const dhOutput = x25519SharedSecret(
    mySignedPrekeyPrivateKey,
    aliceRatchetDhPub,
  );
  const { rootKey, chainKey } = rootStep(sessionKey, dhOutput);

  const session: RatchetSession = {
    peerUserId,
    peerDeviceId,
    rootKey,
    sendingChainKey: null, // established lazily on our first actual send
    receivingChainKey: chainKey,
    dhPub: mySignedPrekeyPublicKey, // reuse SPK keypair as our initial ratchet key
    dhPriv: mySignedPrekeyPrivateKey,
    peerDhPub: aliceRatchetDhPub,
    sendingChainIndex: 0,
    previousSendingChainLength: 0,
    receivingChainIndex: 0,
    receivingChainCount: 0,
    skippedMessageKeys: {},
    updatedAt: new Date().toISOString(),
  };

  await setRatchetSession(ownUserId, session);
}

/**
 * Encrypt a plaintext message for a peer.
 *
 * If our sending chain isn't established yet (we've only received into
 * this session so far), performs a fresh DH-ratchet step first: a new
 * ratchet keypair against the peer's last-known ratchet key. Otherwise
 * performs the symmetric chain step, derives a message key, encrypts with
 * XChaCha20-Poly1305, and advances the sending chain.  Returns the
 * ciphertext, nonce, and header (which goes on the wire in the clear).
 */
export async function ratchetEncrypt(
  ownUserId: string,
  peerUserId: string,
  plaintext: Uint8Array,
  senderId: string,
  recipientId: string,
): Promise<{
  ciphertext: string;
  nonce: string;
  header: RatchetHeader;
}> {
  const session = await getRatchetSession(ownUserId, peerUserId);
  if (!session) {
    throw new Error(`No ratchet session for peer ${peerUserId}`);
  }

  if (session.sendingChainKey === null) {
    if (!session.peerDhPub) {
      throw new Error(
        `Cannot send to ${peerUserId}: no peer ratchet key known yet`,
      );
    }
    const newDh = generateEphemeralKey();
    const dhOutput = x25519SharedSecret(newDh.privateKey, session.peerDhPub);
    const { rootKey, chainKey } = rootStep(session.rootKey, dhOutput);

    session.previousSendingChainLength = session.sendingChainIndex;
    session.rootKey = rootKey;
    session.sendingChainKey = chainKey;
    session.dhPub = newDh.publicKey;
    session.dhPriv = newDh.privateKey;
    session.sendingChainIndex = 0;
  }

  // Derive message key from the sending chain
  const { messageKey, nextChainKey } = chainStep(session.sendingChainKey);

  // Encrypt
  const aad = buildAad(senderId, recipientId, ALG_VERSION);

  const cipherInput = xchachaEncrypt(messageKey, plaintext, aad);

  // Build header — pn is the previous chain's frozen length, constant for
  // every message in this epoch; n is this message's own index.
  const header: RatchetHeader = {
    dhPub: session.dhPub,
    pn: session.previousSendingChainLength,
    n: session.sendingChainIndex,
  };

  // Advance chain
  session.sendingChainKey = nextChainKey;
  session.sendingChainIndex += 1;
  session.updatedAt = new Date().toISOString();
  await setRatchetSession(ownUserId, session);

  return {
    ciphertext: cipherInput.ciphertext,
    nonce: cipherInput.nonce,
    header,
  };
}

/**
 * Decrypt a ciphertext message from a peer.
 *
 * Checks the skipped-message-key cache first — keyed by (dhPub, n), so it
 * resolves both an out-of-order message within the current epoch AND a
 * message delayed across a since-completed ratchet. Otherwise performs a
 * DH-ratchet step if the header's dhPub differs from the last known peer
 * key (this fires exactly once per direction change — including the very
 * first message a sender-initialized session ever receives, since
 * peerDhPub starts null).  Returns the plaintext Uint8Array.
 */
export async function ratchetDecrypt(
  ownUserId: string,
  peerUserId: string,
  ciphertext: string,
  nonce: string,
  header: RatchetHeader,
  senderId: string,
  recipientId: string,
): Promise<Uint8Array> {
  const session = await getRatchetSession(ownUserId, peerUserId);
  if (!session) {
    throw new Error(`No ratchet session for peer ${peerUserId}`);
  }

  // Everything below computes into local scratch variables and NEVER
  // mutates `session` directly until after xchachaDecrypt has actually
  // authenticated the ciphertext. This matters because header.dhPub/n/pn
  // are wire-supplied and unauthenticated at dispatch time — re-processing
  // a stale envelope (a replay, or simply re-viewing an old message whose
  // key has since rotated away) looks identical to a genuine new ratchet
  // key at this point, and must not corrupt the live session if the AEAD
  // tag ultimately fails to verify. This is enforced here rather than
  // relying on the storage layer happening to clone-on-read.

  // Skipped-key cache lookup first: covers a message that arrived out of
  // order within the current epoch, and one delayed across a ratchet we've
  // since moved past (its dhPub no longer matches session.peerDhPub, but we
  // cached its key — tagged with the epoch it belonged to — before that
  // epoch's chain state was discarded).
  const skipKey = `${header.dhPub}:${header.n}`;
  const cachedKey = session.skippedMessageKeys[skipKey];
  if (cachedKey) {
    const aad = buildAad(senderId, recipientId, ALG_VERSION);
    const plaintext = xchachaDecrypt(cachedKey, ciphertext, nonce, aad);

    delete session.skippedMessageKeys[skipKey];
    session.receivingChainCount += 1;
    session.updatedAt = new Date().toISOString();
    await setRatchetSession(ownUserId, session);
    return plaintext;
  }

  let nextRootKey = session.rootKey;
  let nextReceivingChainKey = session.receivingChainKey;
  let nextSendingChainKey = session.sendingChainKey;
  let nextPeerDhPub = session.peerDhPub;
  const scratchSkipped: Record<string, string> = {};

  if (session.peerDhPub !== header.dhPub) {
    // New ratchet key from the peer (or a stale/replayed envelope whose
    // dhPub no longer matches — indistinguishable until the tag check
    // below). Speculatively compute keys for any messages we haven't seen
    // yet in the epoch we're about to retire, tagged with ITS dhPub.
    if (session.receivingChainKey !== null && session.peerDhPub !== null) {
      collectSkippedKeys(
        scratchSkipped,
        session.receivingChainKey,
        session.receivingChainIndex,
        session.peerDhPub,
        header.pn,
      );
    }

    // DH ratchet step: mix the peer's new ratchet key with our CURRENT
    // ratchet keypair (not a freshly generated one — our own sending
    // direction only re-ratchets lazily, on next send, in ratchetEncrypt).
    const dhOutput = x25519SharedSecret(session.dhPriv, header.dhPub);
    const { rootKey, chainKey } = rootStep(session.rootKey, dhOutput);

    nextRootKey = rootKey;
    nextReceivingChainKey = chainKey;
    nextSendingChainKey = null; // stale — re-established lazily on next send
    nextPeerDhPub = header.dhPub;
  } else if (header.n < session.receivingChainIndex) {
    // Same epoch, index already behind us, and not in the skip cache above
    // — either a duplicate delivery of an already-consumed message, or one
    // evicted by the cache's size cap.
    throw new Error(
      `Skipped message key for index ${header.n} not found in cache`,
    );
  } else {
    // Same ratchet epoch, in-order or ahead — cache-ahead if needed and
    // advance to the chain key this message's own index will derive from.
    nextReceivingChainKey = collectSkippedKeys(
      scratchSkipped,
      session.receivingChainKey,
      session.receivingChainIndex,
      header.dhPub,
      header.n,
    );
  }

  if (nextReceivingChainKey === null) {
    throw new Error(`Receiving chain not established for peer ${peerUserId}`);
  }

  // Derive message key from the (speculative) receiving chain
  const { messageKey, nextChainKey } = chainStep(nextReceivingChainKey);

  // Decrypt — this is the actual authentication check. Nothing above this
  // point has touched `session` yet, so a thrown "invalid tag" here leaves
  // the live session exactly as it was.
  const aad = buildAad(senderId, recipientId, ALG_VERSION);
  const plaintext = xchachaDecrypt(messageKey, ciphertext, nonce, aad);

  // Authenticated — now it's safe to commit everything.
  session.rootKey = nextRootKey;
  session.sendingChainKey = nextSendingChainKey;
  session.peerDhPub = nextPeerDhPub;
  session.receivingChainKey = nextChainKey;
  session.receivingChainIndex = header.n + 1;
  session.receivingChainCount += 1;
  Object.assign(session.skippedMessageKeys, scratchSkipped);
  evictOldestSkippedKeys(session);
  session.updatedAt = new Date().toISOString();
  await setRatchetSession(ownUserId, session);

  return plaintext;
}

// ── Skipped message key handling ────────────────────────────────────────

/**
 * Compute message keys for chain indices in [fromIndex, until) into `dest`
 * (tagged `${dhPubTag}:${index}`) — a pure computation that does NOT touch
 * the session, so the caller can commit `dest` (and the returned resulting
 * chain key) only after the actual message has been authenticated. Tagging
 * by dhPub means a cached key remains findable by ratchetDecrypt's cache
 * lookup even after a later DH-ratchet moves session.peerDhPub elsewhere.
 * Returns the chain key at position `until` (the position this message's
 * own key derives from), or null if there was no chain to skip within.
 */
function collectSkippedKeys(
  dest: Record<string, string>,
  fromChainKey: string | null,
  fromIndex: number,
  dhPubTag: string,
  until: number,
): string | null {
  if (fromChainKey === null) return null;
  // header.n/header.pn are wire-supplied and not yet authenticated at this
  // point (the AEAD tag is only checked after this returns) — an attacker
  // or a corrupted message could otherwise force an unbounded synchronous
  // HMAC loop and freeze the tab. No legitimate skip should ever need to
  // jump further than the cache can hold anyway.
  if (until - fromIndex > MAX_SKIPPED_KEYS) {
    throw new Error(
      `Refusing to skip ${until - fromIndex} chain steps (max ${MAX_SKIPPED_KEYS})`,
    );
  }
  let chainKey = fromChainKey;
  for (let count = fromIndex; count < until; count++) {
    const { messageKey, nextChainKey } = chainStep(chainKey);
    dest[`${dhPubTag}:${count}`] = messageKey;
    chainKey = nextChainKey;
  }
  return chainKey;
}

/**
 * Enforce the skipped-key cache's size cap by evicting oldest-inserted
 * entries. Compound keys always contain ":" so they're never
 * integer-index-like, meaning Object.keys() reliably returns them in
 * insertion order.
 */
function evictOldestSkippedKeys(session: RatchetSession): void {
  const keys = Object.keys(session.skippedMessageKeys);
  if (keys.length > MAX_SKIPPED_KEYS) {
    const toRemove = keys.slice(0, keys.length - MAX_SKIPPED_KEYS);
    for (const k of toRemove) {
      delete session.skippedMessageKeys[k];
    }
  }
}
