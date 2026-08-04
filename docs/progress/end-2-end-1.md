# End-to-end encryption for chat — Part 2 (post-launch hardening)

*Continuation of `docs/progress/end-2-end.md` (the original design + Revs 1-6). That doc covers the
protocol design and the first six review rounds (crypto-breaking bugs, the missing BFF proxy layer,
the per-user Settings > Privacy toggle, sender-can't-decrypt-own-room-messages, and the Redis
bundle-TTL plaintext-fallback bug). This doc picks up from there — Rev 7 onward — and is written to
directly answer two things Berkay asked for in this round: a record of what changed, and a detailed
guide for how to keep working on messaging + encryption from here.*

---

## 1. Where Rev 7 started: an unfinished session from a different tool

A separate AI coding session (transcript saved at repo-root `end2endwork.md`, ~9,500 lines, tool
session `ses_036678f56ffe8...`) had been working the E2EE feature and stopped mid-task — its last
action was a failing `pnpm typecheck`, never re-run, right after adding a **WebSocket re-key
protocol**: when a DM recipient's ratchet session is gone (they cleared site data, switched devices,
etc.), the sender has no way to know — so the conversation just shows `🔒 Encrypted` forever. The
fix: on a decrypt failure that looks like "no session" (not corruption), the receiver sends a new
`e2ee-rekey` WS frame to the sender; the sender deletes its own session for that peer, so its *next*
message automatically re-runs X3DH instead of silently failing forever.

**What that session built** (frontend `next-js-boilerplate/`, backend `nest-js-boilerplate/`):

- `src/lib/crypto/chat.ts` — `DecryptedMessageResult` gained `needsRekey?: boolean`, set when
  `decryptMessage()`/`decryptMessages()` catch `"No ratchet session"` or
  `"Receiving chain not established"`.
- `src/lib/realtime/event-dispatch.ts` — new inbound frame handler for `"e2ee-rekey"`: deletes the
  ratchet session for the peer who sent it, invalidates the `["messages", peerId]` query so the
  conversation re-fetches.
- `src/views/messages/ChatView.tsx` — a `useEffect` watching `conversationMessages` for any message
  with `needsRekey`, sending one `e2ee-rekey` WS request per peer per conversation-open
  (`rekeySentRef` dedupe).
- `nest-js-boilerplate/src/messaging/messaging-ws.gateway.ts` — registered the `'e2ee-rekey'` frame
  handler, following the exact same pattern as the existing `typing-start`/`typing-stop` handlers
  (`emitToPage(peerId, 'messages', {...})`).

**What was picked up and finished this round:**

1. Re-ran `pnpm typecheck` (was failing on `ChatView.tsx`, TS2352 — an invalid cast) — fixed, now
   clean.
2. Re-ran `pnpm lint` — clean (0 errors, only the same pre-existing 55-56 unrelated warnings this
   feature has always had).
3. Re-ran the full frontend test suite — 776/786, same 10 pre-existing/unrelated failures this repo
   has had all along (`conformance.test.ts`, `settings/security` MFA test) — **zero new failures**.
4. Typechecked the backend gateway change for the first time (it had never successfully compiled —
   the one attempt in the original session used the wrong script name and was never retried). Used
   `npx tsc --noEmit -p tsconfig.build.json` (the config `nest build` actually uses, which excludes
   spec files) rather than the raw `tsconfig.json`, since the raw config surfaces ~90 lines of
   pre-existing spec-file type errors that have nothing to do with this feature (confirmed via
   `git stash` on a clean tree). Found and fixed one real prettier formatting error in
   `messaging-ws.gateway.ts` in the process — nobody had linted the new handler either.
5. Implemented the one item left on that session's own todo list: `ChatMessageBubble.tsx` now shows
   **"Re-syncing keys…"** (distinct copy) when `needsRekey` is true, instead of the same generic
   "Encrypted" text used for every other undecryptable state — so a user can tell "this is actively
   recovering" from "this is stuck."

---

## 2. The real bug: E2EE storage was never scoped per account

Berkay then screenshotted a real conversation ("Blue Bird Rex") stuck showing `🔒 Encrypted` /
"Re-syncing keys…" for every message, with the sender's own messages rendering as garbled text. That
led to the actual headline finding of this round.

### Root cause

`next-js-boilerplate/src/lib/crypto/store.ts` opened **one single IndexedDB database, named literally
`"e2ee"`, per browser** — not per logged-in account:

```ts
// before
const DB_NAME = "e2ee";
function getDb(): Promise<IDBPDatabase> { ... openDB(DB_NAME, ...) ... }

export async function getIdentity(): Promise<DeviceIdentity | null> {
  const db = await getDb();
  return (await db.get(IDENTITY_STORE, "current")) ?? null;   // ← fixed key "current"
}
```

- `getIdentity()`/`setIdentity()` always read/wrote the fixed key `"current"` — one identity, period,
  no matter who's logged in.
- Ratchet sessions (`getRatchetSession`/`setRatchetSession`) were keyed only by `peerUserId`, never by
  `(ownUserId, peerUserId)`.
- `src/lib/crypto/identity.ts`'s `ensureIdentity(deviceId)` took **no user parameter at all** — if any
  identity already existed in that browser, it was reused unconditionally for whoever was logged in.
- The device ID itself had **three separate, independently-drifted copies** of a bare
  `localStorage["e2ee:deviceId"]` key (`chat.ts`, `useE2eeIdentity.ts`, and an inline fallback in
  `actions.ts`'s retry path) — same bug, same fixed key, three places.

### Why this produced exactly what was in the screenshot

If the same browser is ever used to log into a second account — which is exactly what testing your
own app with a throwaway/test account looks like — the second account's `ensureIdentity()` call finds
the first account's identity sitting in IndexedDB and silently adopts it as its own, then re-registers
*that* identity/bundle to the server under the second account's name. From that point on, every X3DH
and ratchet computation for either account uses key material that doesn't match what the server (or
the peer) actually has on file — which is precisely the `"No ratchet session"` /
`"Receiving chain not established"` failure pattern behind every stuck bubble.

Ruled out "this is just stale test data from mid-development code changes" before concluding it was a
real bug: `docker compose logs` showed both `app` and `nextjs` ran a single unchanged build for the
entire window those messages were sent (22:42–23:16 UTC) — the only restart was at 23:49, after every
message in the screenshot. The two accounts' keys were already cross-contaminated by the time any of
those messages were sent; no server-side event caused it.

This is not just a "messages don't decrypt" bug. On a shared/kiosk browser, it's a real confidentiality
issue: one account's private identity keys can end up loaded into another account's session.

### The fix — one physical database per user, not per browser

```ts
// after
const dbPromises = new Map<string, Promise<IDBPDatabase>>();

function getDb(ownUserId: string): Promise<IDBPDatabase> {
  let dbPromise = dbPromises.get(ownUserId);
  if (!dbPromise) {
    dbPromise = openDB(`e2ee:${ownUserId}`, DB_VERSION, { ... });
    dbPromises.set(ownUserId, dbPromise);
  }
  return dbPromise;
}

export async function getIdentity(ownUserId: string): Promise<DeviceIdentity | null> {
  const db = await getDb(ownUserId);
  return (await db.get(IDENTITY_STORE, "current")) ?? null;
}
```

Every exported function in `store.ts` now takes `ownUserId` as its first argument. That was threaded
through the whole call chain, not just patched at the boundary:

| File | What changed |
|---|---|
| `lib/crypto/store.ts` | Every function (`getIdentity`, `setIdentity`, `deleteIdentity`, both identity-private-key getters/setters, signed/one-time prekey CRUD, `getRatchetSession`/`setRatchetSession`/`deleteRatchetSession`, sender-key chain CRUD, safety-number CRUD) gained a leading `ownUserId: string` param. DB opened per-user, cached in a `Map`. |
| `lib/crypto/ratchet.ts` | `initSenderSession`, `initReceiverSession`, `ratchetEncrypt`, `ratchetDecrypt` all gained `ownUserId`, threaded into their `getRatchetSession`/`setRatchetSession` calls. |
| `lib/crypto/envelope.ts` | `encryptDmMessage` gained a new leading `ownUserId` param. `decryptDmMessage` didn't need a new one — it already carries the caller's own id as `recipientUserId` (documented as "the current user's own id"); reused that instead of adding a redundant param. |
| `lib/crypto/identity.ts` | `ensureIdentity(ownUserId, deviceId)`, plus both private-key getters, now require the caller's own id. |
| `lib/crypto/chat.ts` | Consolidated all three duplicate deviceId helpers into one exported, scoped function: `getDeviceId(ownUserId)`, key = `` `e2ee:deviceId:${ownUserId}` ``. `encryptForSend`, `decryptMessage`, `decryptMessages`, `decryptConversationPreview` all thread `ownUserId` into every store/identity call they make. |
| `lib/crypto/sender-keys.ts` | Room chat had the identical flaw. `getOrCreateSenderKeyChain`, `rotateSenderKeyChain` gained `ownUserId`. `encryptRoomMessage`'s existing `senderId` param was already effectively `ownUserId` — reused rather than adding a duplicate. `ensureReceivedSenderKey` gained a genuinely new `ownUserId` param (its existing args are all about the peer, not the caller). |
| Call sites | `actions.ts`, `query.ts`, `event-dispatch.ts`, `useE2eeIdentity.ts`, `ChatView.tsx`, `ChatRoomHandlers.tsx`, `SafetyNumberModal.tsx`, `SafetyNumberBadge.tsx` all updated to pass the logged-in user's id through. |
| Tests | `ratchet.test.ts`, `integration.test.ts`, `sender-keys.test.ts` — mocks and ~60 direct call sites updated. The alice/bob two-party tests follow one consistent rule that made most of this mechanical: `ownUserId` is simply "whichever of alice/bob is *not* the existing `peerUserId` argument." |

**Verified clean after the fix, not just before it**: full `pnpm typecheck`, `pnpm lint` (0 errors),
124/124 crypto+realtime tests, and the same 776/786 full-suite baseline (10 pre-existing/unrelated
failures) as every check earlier in this doc.

### What this fix does *not* do

- **It can't un-corrupt an already-poisoned conversation.** "Blue Bird Rex" (and the follow-up
  self-chat screenshot) both had their local identities cross-contaminated *before* this fix landed.
  Even a fresh rekey handshake right now would reuse the same already-wrong keys on whichever side
  still has the corrupted local identity. This is inherent to the crypto (forward secrecy + "device
  loss = key loss" is the documented design, per `docs/backend/E2EE.md` §6) — not a residual bug to
  chase further. **The only way to see clean, working encryption in the browser now is a fresh
  conversation between two accounts that have never shared a browser before *this* fix was deployed.**
- **It doesn't rebuild/redeploy anything by itself.** See §3 — this is almost certainly why the
  follow-up screenshot (self-chat, still showing "Disconnected" / undecrypted messages) still looked
  broken: the running `nextjs`/`app` containers were built *before* this fix was written, so the
  browser was still running the old, unscoped-storage code the whole time.

---

## 3. Before testing again: this needs a redeploy

Both `nextjs` and `app` are **built production images** in this stack (`docker-compose.yml`'s
`nextjs`/`app` services use `build:` + a compiled `node ...` entrypoint, not `next dev`) — code changes
on disk do **not** take effect until the image is rebuilt and the container is recreated. This fix
touches both:

- Frontend (`next-js-boilerplate/`): the whole `lib/crypto/*` rewrite, plus every call site listed
  above.
- Backend (`nest-js-boilerplate/`): `messaging-ws.gateway.ts` (the `e2ee-rekey` handler, from the
  earlier session — already correct, just never rebuilt since).

Rebuild + redeploy, matching this repo's own established pattern (see `docs/progress/end-2-end.md`
Rev 4's "operational trap" note and the `prod-deploy-eys-gen-tr` runbook):

```bash
docker compose build app nextjs
docker compose up -d --no-deps app nextjs
```

`--no-deps` avoids cascading into unrelated one-shot services (`vault-init`, `migrate`,
`minio-setup` re-run on every `up` invocation otherwise). No Prisma schema change in this round, so
`migrate` doesn't need rebuilding this time.

After redeploy, **clear IndexedDB for the domain in the test browser(s)** before testing — the old
`"e2ee"` (unscoped) database is still sitting there from before the fix and is now simply dead/unused
weight, but any account that already had corrupted state in it needs a clean slate to prove the fix
rather than re-observe the old poisoned session. DevTools → Application → IndexedDB → delete `e2ee` →
reload. (This is exactly the "device loss = key loss" recovery path already documented — the app is
designed to handle a client losing its local keys.)

---

## 4. Detailed guide: how to keep changing messaging + encryption from here

This section is the "how to change messaging with encryption" writeup Berkay asked for — a working
map of the architecture plus concrete guidance for common changes, aimed at whoever (human or AI)
touches this feature next.

### 4.1 The mental model in one paragraph

Every DM conversation between two users has an independent **Double Ratchet session**, bootstrapped
once via **X3DH** on the first message either side ever sends the other. Each user's browser holds its
own private key material in **IndexedDB, scoped per logged-in user** (as of this round). The server
(Postgres + Redis) never sees plaintext and never sees private keys — it only ever stores/relays
ciphertext envelopes and public key bundles. Rooms use a *different* mechanism (sender-keys, §1.5 of
the original design doc) because a ratchet is inherently pairwise and rooms have N members.

### 4.2 Where things live (file map)

```
next-js-boilerplate/src/lib/crypto/
  primitives.ts     — raw crypto: X25519, XChaCha20-Poly1305, HKDF, Ed25519. Change this only
                       for actual cryptographic reasons; everything else composes these.
  x3dh.ts            — first-contact handshake (x3dhInitiate / x3dhRespond).
  ratchet.ts         — the Double Ratchet state machine: initSenderSession, initReceiverSession,
                        ratchetEncrypt, ratchetDecrypt. Owns RatchetSession shape/persistence.
  envelope.ts        — glue layer: encryptDmMessage/decryptDmMessage tie X3DH + ratchet into the
                        MessageEnvelopeV1 wire format actually stored in Message.envelope.
  sender-keys.ts      — room encryption: chain-key management, wrap/unwrap for distribution,
                        distributeSenderKeyIfNeeded / ensureReceivedSenderKey.
  identity.ts        — per-device identity + prekey bundle generation/storage (ensureIdentity).
  store.ts           — the ONLY file allowed to touch IndexedDB directly. Everything above goes
                        through this. Every function takes ownUserId first.
  chat.ts             — highest-level DM API: encryptForSend, decryptMessage(s),
                        decryptConversationPreview. This is what the UI layer actually calls.
  attachments.ts      — encrypted file attachment helpers.
  fingerprint.ts      — safety-number computation (out-of-band identity verification).

next-js-boilerplate/src/
  hooks/messages/useE2eeIdentity.ts   — lazy identity generation + server bundle registration,
                                          triggered on first mount of Messages/Chat Room pages.
  api/client/messages/{actions,query}.ts — where encrypt-on-send and decrypt-on-fetch actually
                                          happen ("decrypt at the boundary" — see doc's own comments).
  lib/realtime/event-dispatch.ts      — where encrypt/decrypt happens for the *live* WS path
                                          (as opposed to the REST fetch path above).
  views/messages/, views/chat-room/   — UI. Should stay "ciphertext-naive" — components render
                                          msg.body and a small needsRekey/encrypted flag, nothing
                                          crypto-aware belongs here.

nest-js-boilerplate/src/
  e2ee/                — E2eeKeysService (Redis-backed bundle/OTPK storage), controllers for
                          register/claim/status/wipe, room sender-key publish/fetch.
  messaging/messaging-ws.gateway.ts — WS frame routing, including the e2ee-rekey handler.

next-js-boilerplate/src/app/api/e2ee/[...path]/route.ts
                      — the BFF bridge (cookie-auth → header-auth) every e2ee REST call goes
                        through. Keeps the "e2ee" path segment (unlike sibling catch-alls) because
                        the NestJS controllers are literally @Controller('api/e2ee/...').
```

### 4.3 The three states a message bubble can be in, and why

| `msg.body` | `msg.encrypted` | `msg.needsRekey` | Rendered as |
|---|---|---|---|
| real text | `false` | — | the actual message |
| `null` | `true` | `true` | "🔒 Re-syncing keys…" — decrypt failed with a *recoverable* error (no session / receiving chain not established); a rekey request has been sent, expect it to resolve once both sides are next online. |
| `null` | `true` | `false`/absent | "🔒 Encrypted" — decrypt failed for some other reason (auth-tag mismatch, skipped-key-cache miss). Self-heals on next successful message in that direction, or is genuinely permanent if the underlying session is unrecoverable (e.g. the corrupted-identity scenario in §2). |

Room messages never carry `needsRekey` — sender-key chains don't have a rekey protocol; a failed room
decrypt always renders "[Encrypted]" via a different, simpler code path in `query.ts`/`event-dispatch.ts`.

### 4.4 How to add a new field to what gets encrypted

`MessagePlaintextV1` (`lib/crypto/types.ts`) is the JSON structure that actually gets encrypted — today
it's `{ text, attachment? }`. To add a new field (e.g. a reply-to reference):
1. Add it to `MessagePlaintextV1`.
2. Populate it in `encryptForSend()` (`chat.ts`) before calling `encryptDmMessage`.
3. Read it back out wherever `decryptMessage`/`decryptMessages` results are consumed (`query.ts`,
   `event-dispatch.ts`) and surface it on the `Message` type (`types/messages/ChatView-types.ts`) the
   same way `decryptedAttachment` was added.
4. Do the equivalent for rooms in `encryptRoomMessage`/`decryptRoomMessage` (`sender-keys.ts`) if the
   field applies there too — it's a separate JSON blob, not shared code.
Never add a plaintext counterpart column server-side "just in case" — the whole point is the server
never sees it.

### 4.5 How to debug "messages aren't decrypting" for a specific conversation

1. **Check the account-sharing trap first** (§2) — has this browser ever logged into a second account?
   If yes and it predates this round's fix, that conversation's keys may be permanently
   cross-contaminated; a clean IndexedDB + fresh conversation is the only way to confirm the *code* is
   fine.
2. **Check `connectionState`/"Disconnected"** in the chat header — the rekey recovery path needs an
   open WS connection to fire at all; if it's down, "Re-syncing keys…" will sit there indefinitely even
   though nothing is actually broken.
3. **Check the browser console** for `[E2EE] Failed to decrypt ...` warnings — `chat.ts`'s catch blocks
   log the real underlying error (`No ratchet session`, `Receiving chain not established`,
   `invalid tag`, `Skipped message key for index N not found in cache`) before falling back to the
   generic bubble state.
4. **Check Redis bundle state** for both accounts:
   `docker exec boilers-redis-1 redis-cli KEYS 'e2ee:bundle:*'` and inspect TTL/contents — a peer with
   no registered bundle produces a distinct, different error ("User has no registered E2EE keys") than
   a ratchet desync.
5. If it's a genuine ratchet desync and not account-sharing: this is the class of bug the rekey
   protocol (§1) exists to self-heal from a *live* conversation. It cannot help a conversation where
   both sides' local state is gone or wrong from the start (fresh browser data wipe with no messages
   exchanged since) — that's `docs/backend/E2EE.md` §6's "device loss = key loss" by design, not a bug.

### 4.6 Known remaining gaps (carried over, still true)

Pulled forward from `end-2-end.md`'s "documented as deferred" list — still open, still deliberate,
not silently dropped:
- No durable persisted-plaintext cache — a message's key is used once and discarded (real forward
  secrecy); re-fetching an old message re-derives from ciphertext, which fails once the ratchet has
  moved past it. Real Signal/WhatsApp persist decrypted plaintext locally instead. Product decision,
  not yet made.
- Signed-prekey rotation (~30 days per the original plan) still isn't implemented.
- No UI treatment distinguishing "permanently lost because of forward secrecy" from "temporarily
  re-syncing" for messages sent *before* a key reset (only the live-message recovery path from §1 was
  ever built).

### 4.7 Testing changes safely (avoiding the §2 trap again)

- **Never test two accounts in the same browser profile** without clearing IndexedDB between account
  switches, until/unless a "log out wipes local E2EE state" safeguard is added (not yet built — would
  be a reasonable follow-up: call a `wipeIdentity(ownUserId)` in the logout flow, or at minimum on
  detecting the logged-in `user.id` changed from the last one this browser saw).
- Prefer two separate browser profiles / one regular + one incognito window for any manual two-party
  test.
- The crypto unit tests (`ratchet.test.ts`, `integration.test.ts`, `sender-keys.test.ts`) run against
  an in-memory mock of `store.ts` and don't need a browser at all — fastest way to verify a ratchet/X3DH
  change before ever touching the running app: `npx vitest run src/lib/crypto`.
