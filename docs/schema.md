# Schema Index

A reverse index from **product component → Prisma schema requirement**, for anyone building a new
project off this boilerplate who wants a subset of its features rather than all of it. The full
schema lives at
[`nest-js-boilerplate/prisma/schema.prisma`](../nest-js-boilerplate/prisma/schema.prisma) (38
models); this page maps each of its models/columns to the specific backend module(s) in
[backend/](./backend/README.md) that actually read or write it, verified against live source (every
mapping below was confirmed with `grep` against `nest-js-boilerplate/src`, not inferred from model
names or schema comments — several models/columns turned out to be scaffolded but never wired to
any feature; see [§ Models with no real feature behind them](#models-with-no-real-feature-behind-them)).

Not a data-modeling guide and not a proposal to change the schema — it describes what's there today,
including the dead parts, the same "document reality, flag what's wrong" approach as the rest of
`docs/`. See [conventions.md](./conventions.md) for how this file relates to the rest of the set and
[architecture.md](./architecture.md) for cross-cutting system design (auth token model, BFF pattern,
tier-based RBAC) that isn't schema-specific.

## How to use this

1. Pick the components you want from [§ Per-component requirements](#per-component-requirements).
2. Take the union of every table each one lists. `User` is always in that union — nearly everything
   depends on it — but most of its ~45 non-relation columns belong to one specific component (see
   [§ User](#user)); drop the columns whose owning component you're dropping, keep the rest.
3. Watch for two special cases, both called out inline where they apply:
   - **Cross-component reads.** A few modules read a table they don't own (e.g. `usage` reads
     `Message`/`RoomMessage`/`PendingUpload` to compute storage totals). Dropping the owning
     component breaks the reader too — each entry below says what it reads from elsewhere.
   - **Unmanaged FK targets.** `team-members` and `project-tasks` require a `Team`/`Project` row to
     already exist, but nothing in this boilerplate can create one (`CROSS-002` (resolved — fixed 2026-09-03: already structural-only — `ProjectTasksModule`/`TeamMembersModule` live in `DEMO_MODULES`, not in the always-on core)).
     If you keep either component, you're also signing up to build that missing creation path.
4. Everything in [§ Models with no real feature behind them](#models-with-no-real-feature-behind-them)
   is safe to drop regardless of what you keep — confirmed zero real consumers, project-wide.

---

## User

The one model nearly every component touches — `id`/`createdAt`/`updatedAt`/`deletedAt` plus the
groups below. "Owning component" means the module that actually reads/writes that column (checked via
`grep -rn` against every real, non-demo module in `nest-js-boilerplate/src`); a column not in any
group here has zero real owner at all — see [§ Dead columns](#dead-columns-on-user).

| Column group | Columns | Owning component |
|---|---|---|
| Core identity | `email`, `emailVerifiedAt`, `passwordHash`, `passwordSetAt`, `status`, `role` | [Auth](#auth) — needed the moment *any* login exists |
| Login hardening | `lastLoginAt`, `lastLoginIp`, `failedLoginCount`, `lockedUntil` | [Auth](#auth) |
| Name | `name` (optional at registration), `username` (profile-only, not in `RegisterInput`) | [Auth](#auth) at signup + [Profile](#profile) afterward |
| MFA | `mfaEnabled` | [MFA](#mfa) |
| Profile | `avatarUrl`, `hideAvatar`, `bio`, `chatNickname`, `useNickname`, `locale`, `timezone` | [Profile](#profile) |
| Tier / RBAC | `subscriptionTier` | [Authorization](#authorization) (reads, for gating) + [Billing](#billing-stripe) (writes) |
| Billing / Stripe | `stripeCustomerId`, `stripeSubscriptionId`, `subscriptionPeriodStart`, `subscriptionPeriodEnd`, `cancelAtPeriodEnd`, `pendingTier`, `pendingTierEffectiveAt`, `stripeSubscriptionScheduleId` | [Billing (+Stripe)](#billing-stripe) |

Every other component that touches `User` (friends, post, messaging, notification, etc.) only ever
reads `id` to form a foreign key or relation — no additional columns.

### Dropped dead columns on `User` (2026-09-03)

Nine columns/relations that no application code ever referenced — `referredById` /
`referredBy` / `referrals` (self-relation), `birthDate`, `quietHoursStart`, `interests`,
`metadata`, `preferences`, `phoneNumber`, `phoneVerified`, `reputation` — were **removed** from the
schema by migration `20260903120000_drop_dead_schema_add_room_message_reply_delete` (every one was
verified empty in the live database first). `BE-028` (resolved — fixed 2026-09-03: the nine dead `User` columns were dropped by migration). If you need phone verification,
referrals or quiet hours, add the columns back deliberately together with the feature.

---

## Per-component requirements

Organized to match [backend/](./backend/README.md)'s own category grouping. Each entry names the
Prisma models it needs beyond `User` (see above) and links back to that module's real doc.

### Identity & Access

#### Auth
**Tables:** `Account` (OAuth-linked identities), `VerificationToken` (`EMAIL_VERIFICATION`,
`PASSWORD_RESET`, `MAGIC_LINK`, `PASSWORD_CHANGE_UNDO` token types), `Device` (read at login, to
check `trusted` before requiring MFA — full ownership is [Devices](#devices)').
**User columns:** Core identity + Login hardening + `name` (see [§ User](#user)).
See [identity-access/auth](./backend/identity-access/auth/README.md).

#### MFA
**Tables:** `MfaFactor` (TOTP/WebAuthn/SMS/EMAIL factors), `MfaBackupCode`.
**User columns:** `mfaEnabled`. **Also:** `VerificationToken` (`MFA_CHALLENGE` type, shared table
with Auth).
See [identity-access/mfa](./backend/identity-access/mfa/README.md).

#### Devices
**Tables:** `Device`.
See [identity-access/devices](./backend/identity-access/devices/README.md).

#### Sessions
**No dedicated table.** Session state is Redis + JWT, not Postgres — see
[architecture.md § Session authentication](./architecture.md#session-authentication--redis-backed-four-token-compound-key).
Reads `Device` for the trust/list-devices UI (shared with [Devices](#devices)).
See [identity-access/sessions](./backend/identity-access/sessions/README.md).

#### API Keys
**Tables:** `ApiKey`.
See [identity-access/api-keys](./backend/identity-access/api-keys/README.md).

#### CSRF
**No schema.** Stateless double-submit-cookie pattern — nothing persisted.
See [identity-access/csrf](./backend/identity-access/csrf/README.md).

#### Authorization
**No table of its own.** A cross-cutting guard layer (reads `User.role`/`subscriptionTier` on every
guarded request via `RolesGuard`/`TierGuard`) plus two data-owning query surfaces: reads `AuditLog`
(admin audit-log viewer — table is populated by [Outbox](#outbox), not by this module despite the
similar-sounding [Activity Log](#activity-log)), and reads `Post`/`Friendship`/`User` counts (the
`growthStats`/`premiumStats` admin-dashboard demo resolvers — see
`CROSS-035` (resolved — fixed 2026-09-03: `premiumStats`/`growthStats` are `@Roles(ADMIN, SUPERADMIN)`-gated on top of the tier gate, and the Premium nav entry/page is admin-only on web and mobile)).
See [identity-access/authorization](./backend/identity-access/authorization/README.md).

### Social & Content

#### Profile
**No dedicated table** — `User` columns only (see [§ User](#user)).
See [social-content/profile](./backend/social-content/profile/README.md).

#### Friends
**Tables:** `Friendship`.
Also written by [Messaging](#messaging)'s REST-facing `MessagingFriendService` (same table, parallel
transport — see that module's own doc for why). The never-used sibling `Follow` model was dropped on
2026-09-03 (`BE-027` (resolved — fixed 2026-09-03: the `Follow` model was dropped by migration)); `Friendship` is the only social-graph table.
See [social-content/friends](./backend/social-content/friends/README.md).

#### Post
**Tables:** `Post`.
The unwired `Category`/`Tag` models and `Post.categoryId`/`Post.tags` were dropped on 2026-09-03
(`BE-026` (resolved — fixed 2026-09-03: `Category`/`Tag` and `Post.categoryId`/`tags` were dropped by migration)) — nothing in `src/post/` ever referenced them. Add a taxonomy back only
together with the DTOs/resolvers that populate it.
See [social-content/post](./backend/social-content/post/README.md).

#### Comment
**Tables:** `Comment`.
See [social-content/comment](./backend/social-content/comment/README.md).

#### Reactions
**Tables:** `Reaction`.
See [social-content/reactions](./backend/social-content/reactions/README.md).

#### Team Members
**Tables:** `TeamMember`.
⚠ **Requires a pre-existing `Team` row** (and that `Team` requires a pre-existing `Organization`
row) to `connect` to at creation time — and nothing anywhere in this boilerplate can create either.
`Organization`/`Team`/`Project` have no resolver, controller, or seed data at all
(`CROSS-002` (resolved)). If you keep this component, you are also signing up to build
an `Organization`/`Team` creation path yourself; the schema and the join-table logic are real, but
currently unreachable from a fresh database.
See [social-content/team-members](./backend/social-content/team-members/README.md).

#### Project Tasks
**Tables:** `Task`.
⚠ Same caveat as Team Members, one level down: `Task.projectId` requires a pre-existing `Project`
row (which itself requires `Organization`), and neither has a creation path
(`CROSS-002` (resolved)).
See [social-content/project-tasks](./backend/social-content/project-tasks/README.md).

### Messaging & Realtime

#### Messaging
**Tables:** `Message`, `MessageDeletion`, `FavoriteConversation`, `MessageAttachment` (1:1 DMs) —
plus `Room`, `RoomParticipant`, `RoomMessage`, `RoomMessageAttachment` (multi-user chat rooms; both
DM and room persistence live in this one module, not split across Messaging/Realtime).
**Also reads:** `Friendship` — `sendMessage` 403s unless sender/recipient are accepted friends, and
this module's `MessagingFriendService` backs the REST-facing friend-request routes as a parallel
transport to [Friends](#friends)'s GraphQL ones (see
[messaging/README.md](./backend/messaging-realtime/messaging/README.md) for why two transports
exist for the same feature).
See [messaging-realtime/messaging](./backend/messaging-realtime/messaging/README.md).

#### Realtime
**No table of its own.** The WebSocket gateway / Redis pub-sub relay layer — every row it broadcasts
was already persisted by [Messaging](#messaging).
See [messaging-realtime/realtime](./backend/messaging-realtime/realtime/README.md).

#### Notification
**Tables:** `Notification`.
See [messaging-realtime/notification](./backend/messaging-realtime/notification/README.md).

#### Push Notification
**Tables:** `PushSubscription`.
See [messaging-realtime/push-notification](./backend/messaging-realtime/push-notification/README.md).

#### Wire Crypto
**No dedicated table.** The encrypted-envelope columns (`v`, `ct`, `nonce`) live directly on
`Message`/`RoomMessage` (owned by [Messaging](#messaging)) and `PendingUpload` (owned by
[Upload](#upload)) — this module is pure crypto logic, no persistence of its own.
See [messaging-realtime/wire-crypto](./backend/messaging-realtime/wire-crypto/README.md).

#### Upload
**Tables:** `PendingUpload`.
Also backfills `messageId`/`roomMessageId` onto its own rows once
[Messaging](#messaging) saves the message the upload was attached to.
See [messaging-realtime/upload](./backend/messaging-realtime/upload/README.md).

#### RTC (calls, meetings, live streams)
*(Added after the original schema pass — RTC phases 1–4.)*
**Tables:** `RtcRoom` (the kind-agnostic hub: `kind` CALL/MEETING/STREAM, `state`, the
LiveKit-facing `livekitRoomName`, `startedAt`/`endedAt`), `RtcParticipant` (one row per user per
room; `leftAt: null` = currently in — the guard every chat op checks; `livekitIdentity` stores the
**raw** userId), and one product table per kind: `CallSession` (1:1 call state machine +
`ringingAt`/`acceptedAt`/`endedAt`), `Meeting` (slug, host, tier-snapshotted
`maxParticipants`/`maxDurationMinutes`), `LiveStream` (slug, broadcaster, `isLive`,
`peakViewerCount`). Shared sub-features: `RtcChatMessage` (encrypted at rest — `v`/`ct`/`nonce`
envelope like [Wire Crypto](#wire-crypto)'s message columns), `RtcReport`, `RtcRecording`
(⚠ scaffolding — `egressId`/`fileUrl` permanently null until LiveKit Egress is wired).
**User columns:** `subscriptionTier` (all caps), `hideAvatar` (participant summaries).
Schema block: [`prisma/schema.prisma#L1083-L1256`](../nest-js-boilerplate/prisma/schema.prisma).
See [messaging-realtime/rtc](./backend/messaging-realtime/rtc/README.md).

### Billing & Usage

#### Billing (+Stripe)
**Tables:** `BillingAddress`, `Wallet`, `WalletTransaction`.
**User columns:** the Billing/Stripe group (see [§ User](#user)).
`WalletTransaction` — not `Wallet` — is where billing history actually lives: `stripePaymentIntentId`/
`stripeInvoiceUrl` sit directly on it, and `fromWalletId`/`toWalletId` are always null in practice
despite the schema's transfer-ledger shape (two nullable FKs to `Wallet`). `Wallet` itself is only
ever lazily auto-created per user (`WalletService.ensureWallet`) to give those rows something to
anchor to — it's never surfaced as a "wallet" concept anywhere in either frontend's or mobile's UI.
See [billing-usage/billing](./backend/billing-usage/billing/README.md).

#### Usage
**No dedicated table.** Reads aggregates only: `PendingUpload.size` (summed, for upload-storage
usage), `Message.letterCount` + `RoomMessage.letterCount` (summed, for message-storage usage), and
`User.subscriptionTier` (for the plan's limit multiplier).
See [billing-usage/usage](./backend/billing-usage/usage/README.md).

### Platform / Core

#### Activity Log
**No Postgres table at all**, despite the name — this module ingests mobile-client analytics events
straight into the structured logger (Elasticsearch-bound `backend-logs`/`web-logs`), and never
touches the `AuditLog` Prisma model. See [Outbox](#outbox) for what actually populates `AuditLog`.
See [platform-core/activity-log](./backend/platform-core/activity-log/README.md).

#### Outbox
**Tables:** `OutboxEvent` (written by domain services inside the same transaction as their real
write; read/marked-published by the relay worker), `AuditLog` (written *by that same relay worker*
once an event is processed — this is the module that actually populates `AuditLog`).
See [platform-core/outbox](./backend/platform-core/outbox/README.md).

#### Mail
**Tables:** `EmailMessage`, `MailAccount`.
See [platform-core/mail](./backend/platform-core/mail/README.md).

#### Vault, Prisma, Redis, Health, Logging, Config, Telemetry
**No Prisma models.** Pure infrastructure — external-system-backed (Vault, Redis, Elasticsearch,
env vars) or the Prisma client provider itself. `VaultService` additionally has zero consumers of
its own regardless of schema — `BE-023` (resolved — fixed 2026-09-03: `VaultService`/`VaultModule` were deleted).
See [platform-core/README.md](./backend/platform-core/README.md) for each.

#### Common
**No schema**, with one exception: `common/dataloader` does read-only batched lookups of `User` and
`Post` (the `author` field resolver's N+1 guard) — no table it doesn't already share with
[Auth](#auth)/[Post](#post). `crypto`, `exceptions`, `id-codec`, `token-codec`, `utils`, `cookies`
touch no Prisma model.
See [platform-core/common](./backend/platform-core/common/README.md).

---

## Models with no real feature behind them

Confirmed via project-wide `grep` — zero real (non-demo, non-`@generated`) query anywhere in
`src/`. Two different flavors:

| Model | Status | Tracked as |
|---|---|---|
| `Organization` | Required as an unmanaged FK target only (`Team`/`Project` both point at it) — no resolver/controller/seed anywhere | `CROSS-002` (resolved) |
| `Team` | Same — required by [Team Members](#team-members), no creation path | `CROSS-002` (resolved) |
| `Project` | Same — required by [Project Tasks](#project-tasks), no creation path | `CROSS-002` (resolved) |
| `Membership` | Zero references anywhere — not even as an FK target. Same never-built "Organization" feature as the row above, one layer further out | `CROSS-002` (resolved) |

`Category`, `Tag` and `Follow` (plus the implicit `_PostToTag` join table) **no longer exist** — dropped
2026-09-03 by `20260903120000_drop_dead_schema_add_room_message_reply_delete` (`BE-026`/`BE-027`
(resolved)). The same migration removed `MfaFactor`'s never-implemented WebAuthn columns
(`credentialId`, `publicKey`, `counter`, `transports` — `BE-008` (resolved — fixed 2026-09-03: the WebAuthn columns were dropped from `MfaFactor` by migration)) and the producer-less
`NotificationType` values `MENTION`/`FOLLOW`/`SYSTEM` (`BE-014` (resolved — fixed 2026-09-03: `MENTION`/`FOLLOW`/`SYSTEM` were dropped from the enum and `SECURITY` is now produced for password and MFA changes); `SECURITY` stayed and is
now produced — see the notification doc). It also added `RoomMessage.replyToId`/`deletedAt` and the
`RoomMessageDeletion` table for chat-room reply/delete (`CROSS-024` (resolved — fixed 2026-09-03: chat rooms now have reply-to and delete (for me / for everyone) end to end — `RoomMessage.replyToId`/`deletedAt` + `RoomMessageDeletion`, `POST rooms/:roomSlug/messages/:messageId/delete-for-me|delete-for-everyone`, a `room-message-deleted` WS frame, and matching UI in both web apps and Flutter)).

If you don't want [Team Members](#team-members)/[Project Tasks](#project-tasks) at all, drop
`Organization`/`Team`/`Project`/`Membership`/`TeamMember`/`Task` together as one unit — nothing else
references any of them.

---

## Worked examples

**"I want MFA + Auth, nothing else product-wise."**
`User` (Core identity + Login hardening + MFA groups — drop Profile/Tier/Billing groups and every
[dead column](#dead-columns-on-user)), `Account`, `VerificationToken`, `Device`, `MfaFactor`,
`MfaBackupCode`. Six tables total. You do *not* need `Friendship`/`Post`/`Message`/etc. — nothing
under Identity & Access requires anything from another category.

**"I want Messaging, nothing else product-wise."**
`User` (Core identity, at minimum — Messaging needs real accounts to send between), `Message`,
`MessageDeletion`, `FavoriteConversation`, `MessageAttachment`, `Room`, `RoomParticipant`,
`RoomMessage`, `RoomMessageAttachment`, plus `Friendship` (the friend-gate on `sendMessage`, and the
REST friend-request routes this module itself backs — see [Messaging](#messaging)). If you also want
attachments to actually upload rather than 404: add `PendingUpload` ([Upload](#upload)). If you want
push delivery when the recipient is offline: add `PushSubscription`
([Push Notification](#push-notification)) and `Notification` ([Notification](#notification)). Ten to
twelve tables depending how much of the surrounding messaging experience you want, none of them
touching Billing/Social/Platform categories at all.
