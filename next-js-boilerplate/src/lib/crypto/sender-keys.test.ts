/**
 * Room sender-key distribution tests.
 *
 * Verifies the end-to-end wiring that was previously entirely missing:
 * a sender's local chain actually reaches other room members (wrapped
 * per-recipient-device via a DH-derived secret), and a receiver can fetch,
 * unwrap, and use it to decrypt that sender's room messages.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import type { SenderKeyChain } from "./types";

// ── In-memory "backend" state shared across the two simulated clients ───

let roomMembershipVersion = 1;
let roomMembers: Array<{ userId: string; role: string; joinedAt: string }> = [];
const registeredAgreementKeys = new Map<string, string>();
const registeredDeviceIds = new Map<string, string>();
interface PublishedBatch {
  roomSlug: string;
  senderDeviceId: string;
  epoch: number;
  keys: Array<{
    recipientDeviceId: string;
    wrappedKey: string;
    wrapNonce: string;
  }>;
}
const publishedBatches: PublishedBatch[] = [];

vi.mock("@/api/server/e2ee/room-members", () => ({
  fetchRoomMembersServer: vi.fn(async () => ({
    membershipVersion: roomMembershipVersion,
    members: roomMembers,
  })),
}));

vi.mock("@/api/server/e2ee/peer-identity", () => ({
  fetchPeerAgreementKey: vi.fn(
    async (userId: string) => registeredAgreementKeys.get(userId) ?? null,
  ),
}));

vi.mock("@/api/server/e2ee/bundle-status", () => ({
  getBundleStatusServer: vi.fn(async (userId: string) => {
    const deviceId = registeredDeviceIds.get(userId);
    return deviceId ? { registered: true, deviceId } : { registered: false };
  }),
}));

vi.mock("@/api/server/e2ee/publish-sender-keys", () => ({
  publishSenderKeysServer: vi.fn(
    async (roomSlug: string, body: Omit<PublishedBatch, "roomSlug">) => {
      publishedBatches.push({ roomSlug, ...body });
      return { count: body.keys.length };
    },
  ),
}));

vi.mock("@/api/server/e2ee/fetch-sender-keys", () => ({
  fetchSenderKeysServer: vi.fn(async (roomSlug: string) =>
    publishedBatches
      .filter((b) => b.roomSlug === roomSlug)
      .flatMap((b) =>
        b.keys.map((k) => ({
          senderDeviceId: b.senderDeviceId,
          epoch: b.epoch,
          wrappedKey: k.wrappedKey,
          wrapNonce: k.wrapNonce,
          createdAt: new Date().toISOString(),
        })),
      ),
  ),
}));

// "Current user" pointer — sender-keys.ts always asks identity.ts for "my
// own" key with no explicit user param, so the test switches this between
// simulating Alice's device and Bob's device.
let currentUserAgreementPrivateKey = "";
vi.mock("./identity", () => ({
  getIdentityAgreementPrivateKey: vi.fn(
    async (_ownUserId: string) => currentUserAgreementPrivateKey,
  ),
}));

const chains = new Map<string, SenderKeyChain>();
vi.mock("./store", () => ({
  getSenderKeyChain: vi.fn((_ownUserId: string, roomId: string) =>
    Promise.resolve(chains.get(roomId) ?? null),
  ),
  setSenderKeyChain: vi.fn((_ownUserId: string, chain: SenderKeyChain) => {
    chains.set(chain.roomId, { ...chain });
    return Promise.resolve();
  }),
}));

// Re-import after mocks are set up
import { generateIdentityAgreementKey } from "./primitives";
import {
  distributeSenderKeyIfNeeded,
  ensureReceivedSenderKey,
  encryptRoomMessage,
  decryptRoomMessage,
  deriveRoomWrapSecret,
} from "./sender-keys";

describe("Room sender-key distribution", () => {
  beforeEach(() => {
    chains.clear();
    publishedBatches.length = 0;
    registeredAgreementKeys.clear();
    registeredDeviceIds.clear();
    roomMembershipVersion = 1;
    roomMembers = [];
  });

  it("deriveRoomWrapSecret is symmetric between the two parties (DH)", () => {
    const alice = generateIdentityAgreementKey();
    const bob = generateIdentityAgreementKey();
    const fromAlice = deriveRoomWrapSecret(alice.privateKey, bob.publicKey);
    const fromBob = deriveRoomWrapSecret(bob.privateKey, alice.publicKey);
    expect(fromAlice).toBe(fromBob);
  });

  it("distributes Alice's room chain to Bob, who can then decrypt her message", async () => {
    const alice = generateIdentityAgreementKey();
    const bob = generateIdentityAgreementKey();
    registeredAgreementKeys.set("alice", alice.publicKey);
    registeredAgreementKeys.set("bob", bob.publicKey);
    registeredDeviceIds.set("alice", "alice-device-1");
    registeredDeviceIds.set("bob", "bob-device-1");
    roomMembers = [
      { userId: "alice", role: "MEMBER", joinedAt: new Date().toISOString() },
      { userId: "bob", role: "MEMBER", joinedAt: new Date().toISOString() },
    ];

    // Alice distributes her chain before sending.
    currentUserAgreementPrivateKey = alice.privateKey;
    await distributeSenderKeyIfNeeded("general", "alice", "alice-device-1");

    expect(publishedBatches).toHaveLength(1);
    expect(publishedBatches[0].keys).toEqual([
      expect.objectContaining({ recipientDeviceId: "bob-device-1" }),
    ]);

    // Alice encrypts using her (now-distributed) local chain.
    const { envelope } = await encryptRoomMessage(
      "general",
      "alice-device-1",
      "hello room",
      "alice",
    );

    // Bob receives: fetches + unwraps Alice's chain into his own store.
    currentUserAgreementPrivateKey = bob.privateKey;
    await ensureReceivedSenderKey("bob", "general", "alice", "alice-device-1");

    const bobsCopyOfAlicesChain = chains.get("general:alice");
    expect(bobsCopyOfAlicesChain).toBeDefined();
    expect(bobsCopyOfAlicesChain!.epoch).toBe(envelope.senderKeyEpoch);

    const plaintext = await decryptRoomMessage(
      envelope,
      bobsCopyOfAlicesChain!.chainKey,
      "general",
      "alice",
    );
    expect(plaintext).toBe("hello room");
  });

  it("does not re-publish when membership hasn't changed since the last distribution", async () => {
    const alice = generateIdentityAgreementKey();
    const bob = generateIdentityAgreementKey();
    registeredAgreementKeys.set("bob", bob.publicKey);
    registeredDeviceIds.set("bob", "bob-device-1");
    roomMembers = [
      { userId: "alice", role: "MEMBER", joinedAt: new Date().toISOString() },
      { userId: "bob", role: "MEMBER", joinedAt: new Date().toISOString() },
    ];
    currentUserAgreementPrivateKey = alice.privateKey;

    await distributeSenderKeyIfNeeded("general", "alice", "alice-device-1");
    await distributeSenderKeyIfNeeded("general", "alice", "alice-device-1");

    expect(publishedBatches).toHaveLength(1);
  });

  it("the sender can decrypt her own room message (self-echo via WS/history reload)", async () => {
    // No distribution/Bob involved at all — this reproduces exactly what
    // query.ts/event-dispatch.ts do when a message comes back with
    // senderId === ownUserId: look up `${room}:${senderId}`, the same slot
    // a *received* chain from someone else would live under.
    const alice = generateIdentityAgreementKey();
    currentUserAgreementPrivateKey = alice.privateKey;

    const { envelope } = await encryptRoomMessage(
      "general",
      "alice-device-1",
      "hello from me",
      "alice",
    );

    const selfChain = chains.get("general:alice");
    expect(selfChain).toBeDefined();
    expect(selfChain!.chainIndex).toBe(0);

    const plaintext = await decryptRoomMessage(
      envelope,
      selfChain!.chainKey,
      "general",
      "alice",
    );
    expect(plaintext).toBe("hello from me");
  });

  it("self-decrypt keeps working across multiple sends in the same epoch", async () => {
    const alice = generateIdentityAgreementKey();
    currentUserAgreementPrivateKey = alice.privateKey;

    const first = await encryptRoomMessage(
      "general",
      "alice-device-1",
      "message one",
      "alice",
    );
    const second = await encryptRoomMessage(
      "general",
      "alice-device-1",
      "message two",
      "alice",
    );
    const third = await encryptRoomMessage(
      "general",
      "alice-device-1",
      "message three",
      "alice",
    );
    expect(third.envelope.chainIndex).toBe(2);

    // The self-keyed snapshot is written once (at chainIndex 0) and never
    // mutated again by subsequent sends — decrypt fast-forwards it fresh
    // each time, exactly like a chain received from another member.
    const selfChain = chains.get("general:alice");
    expect(selfChain!.chainIndex).toBe(0);

    for (const [envelope, expected] of [
      [first.envelope, "message one"],
      [second.envelope, "message two"],
      [third.envelope, "message three"],
    ] as const) {
      const plaintext = await decryptRoomMessage(
        envelope,
        selfChain!.chainKey,
        "general",
        "alice",
      );
      expect(plaintext).toBe(expected);
    }
  });

  it("rotates to a new epoch and re-publishes when membershipVersion advances", async () => {
    const alice = generateIdentityAgreementKey();
    const bob = generateIdentityAgreementKey();
    registeredAgreementKeys.set("bob", bob.publicKey);
    registeredDeviceIds.set("bob", "bob-device-1");
    roomMembers = [
      { userId: "alice", role: "MEMBER", joinedAt: new Date().toISOString() },
      { userId: "bob", role: "MEMBER", joinedAt: new Date().toISOString() },
    ];
    currentUserAgreementPrivateKey = alice.privateKey;

    await distributeSenderKeyIfNeeded("general", "alice", "alice-device-1");
    expect(publishedBatches).toHaveLength(1);
    expect(publishedBatches[0].epoch).toBe(0);

    // A member leaves/joins — membershipVersion bumps.
    roomMembershipVersion = 2;
    await distributeSenderKeyIfNeeded("general", "alice", "alice-device-1");

    expect(publishedBatches).toHaveLength(2);
    expect(publishedBatches[1].epoch).toBe(1);
  });
});
