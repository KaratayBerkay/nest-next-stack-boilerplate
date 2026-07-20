# Project Enhance 4 — onBlur Backend Checks & Complex Field Validation for the Forms Gallery

> **Rev 1 — 2026-07-20.** Scope: `https://app.eys.gen.tr/v1/en/forms/*` (the
> 12-tab TanStack Form gallery, source `next-js-boilerplate/src/views/forms/*`).
> Berkay's observation on `forms/profile`: leaving the **email** field doesn't
> trigger a backend "this email already exists" check the way it should — the
> gallery validates on blur for UX (so users fix mistakes before they ever reach
> Save/Submit), but almost none of that on-blur validation actually round-trips
> to a backend check. This doc is a **planning register only — no code was
> changed**. It audits all 12 examples field-by-field, names the exact file(s)
> each fix touches, and drafts the exact error copy (EN + TR) to add.
>
> **Headline finding:** the pattern the user wants already exists and works
> correctly in exactly one place — `billing.couponCode`
> (`views/forms/billing/PageContent.tsx:189-196`) uses
> `onBlurAsync` + `onBlurAsyncDebounceMs: 300`. Every other field that needs a
> backend round-trip either (a) checks on `onChangeAsync` per-keystroke instead
> of on blur (`profile.username`), (b) only checks at final submit
> (`checkout.postalCode`, `team-invite` emails, `content-editor.slug`), or (c)
> has **no check of any kind**, sync or async (`profile.email`,
> `checkout.phone`, `billing.taxId`, `api-key.name`). Separately, a real
> backend conflict code (`EX_PROFILE_USERNAME_TAKEN`) is not in the frontend's
> `EXC_TO_SURFACE` map at all, so if the race-condition case it exists for ever
> fires, it shows a generic toast instead of the field-level message the user
> is looking straight at — the gallery's own Error Lab has a scenario
> (`real-unmapped-field`) that demonstrates this exact gap on purpose.
>
> **Rev 2 — 2026-07-20 verification.** Commit `60acca2` implemented most of
> §§1–17 (OB-0 through OB-8), but a code-level trace (not just a presence
> check) found **3 new fields that always report a false-positive error on
> every blur, regardless of the value typed** — `profile.email`,
> `content-editor.slug`, and `editable-table` row `quantity`. Root cause and
> exact fixes are in [§21](#21-rev-2--verification--fix-guide). OB-4c and
> OB-5b were skipped (not implemented, not mentioned in the commit). §§18–20
> (UX-0 through UX-2) are **0% implemented in the UI** — ~25 i18n keys were
> added to both message files but never wired into any component (dead
> keys). See §21 for the full status table and detailed fix instructions.
> Nothing has been fixed yet — like Rev 1, this revision is findings +
> fix-guide only.
>
> **Rev 3 — 2026-07-20 re-verification.** Commit `056531b` implemented §21's
> fix guide. Re-verified by reading every diffed file and re-tracing the same
> logic paths that exposed the Rev 2 bugs. **All 3 critical bugs are fixed
> correctly** — `profile.email`/`content-editor.slug`/editable-table
> `quantity` no longer false-positive on every blur, confirmed via the exact
> gating conditions proposed in §21.2. OB-4c and OB-5b are both wired
> correctly. `pnpm typecheck`, `pnpm lint`, and the 5 new
> `blur-async-check.test.ts` cases are all green. i18n parity holds
> (344/344). Two minor loose ends, neither blocking: (1) `aria-required` was
> never forwarded to `<Input>` (only `required` was), and — more
> significantly — **no field in any of the 12 examples actually passes
> `required=` to `field.TextField`**, so the forwarding fix is currently
> inert in the running app; (2) the 3 new `ConfirmDialog` usages (API-key
> revoke, draft discard, row delete) all pass `description=""`, so the
> confirm step is title-only with no "this is irreversible"-style copy.
> Full detail in [§22](#22-rev-3--re-verification-of-056531b).
>
> **Rev 4 — 2026-07-20, final close-out.** Commit `0069fee` closed both of
> §22.3's remaining gaps: `aria-required={required}` now sits next to
> `required={required}` on `<Input>`, and `required` is now passed on all 9
> `TextField`-backed required fields the doc named (profile
> firstName/lastName/username/email; checkout street/city/province/
> postalCode/email/confirmEmail; api-key name) — the 3 doc-named fields that
> didn't get it (`billing.plan`, `team-invite.role`, `checkout.paymentMethod`)
> use `RadioGroupField`, not `TextField`, so the boolean prop doesn't apply
> to them; correctly out of scope, not a miss. All 3 `ConfirmDialog`s got
> real `description` copy in both locales instead of `""`. `pnpm typecheck`,
> `pnpm lint`, and `pnpm generate-i18n-types` (re-run to confirm the
> generated files aren't drifted) are all clean; i18n parity holds at
> 347/347. **This closes every item raised across Rev 1–3 — §§1–17 (the
> onBlur-check scope this doc's title names) and §18's UX-0a/b/c/d/e audit
> are now fully implemented and verified.** Still open, unchanged, and out
> of this doc's original title scope: UX-0f (upload hints) and the unwired
> remainder of §19/20's hint keys (`bioHint`, `quantityHint`,
> `unitPriceHint`) — flagged in Rev 2/3 as a distinct follow-up pass, not
> part of any commit's claimed scope so far.

---

## Table of Contents

1. [How to use this doc](#1-how-to-use-this-doc)
2. [OB-0 — Cross-cutting fixes (shared infra, do first)](#2-ob-0--cross-cutting-fixes-shared-infra-do-first)
3. [Overview table — all 12 examples](#3-overview-table--all-12-examples)
4. [OB-1 — Profile](#4-ob-1--profile)
5. [OB-2 — API Key](#5-ob-2--api-key)
6. [OB-3 — Billing](#6-ob-3--billing)
7. [OB-4 — Checkout](#7-ob-4--checkout)
8. [OB-5 — Team Invite](#8-ob-5--team-invite)
9. [OB-6 — Content Editor](#9-ob-6--content-editor)
10. [OB-7 — Editable Table](#10-ob-7--editable-table)
11. [OB-8 — Field States](#11-ob-8--field-states)
12. [OB-9 — Filters (N/A)](#12-ob-9--filters-na)
13. [OB-10 — Form Builder (N/A, one adjacent bug noted)](#13-ob-10--form-builder-na-one-adjacent-bug-noted)
14. [OB-11 — Uploads (N/A, already correct)](#14-ob-11--uploads-na-already-correct)
15. [OB-12 — Error Lab](#15-ob-12--error-lab)
16. [i18n additions — full key list](#16-i18n-additions--full-key-list)
17. [Suggested implementation order](#17-suggested-implementation-order)
18. [UX-0 — Cross-cutting "even a child can fill this" fixes](#18-ux-0--cross-cutting-even-a-child-can-fill-this-fixes)
19. [UX-1 — Per-field guidance copy, example by example](#19-ux-1--per-field-guidance-copy-example-by-example)
20. [UX-2 — i18n additions for this pass](#20-ux-2--i18n-additions-for-this-pass)
21. [Rev 2 — Verification & fix guide](#21-rev-2--verification--fix-guide)
22. [Rev 3 — Re-verification of 056531b](#22-rev-3--re-verification-of-056531b)

---

## 1. How to use this doc

Each section names: **Current state** (file:line, what happens today),
**Gap** (why it doesn't match "validate before the user can even reach
Save"), and **Proposed fix** (exact files to touch, exact validator wiring in
prose, exact new i18n keys with EN/TR copy). Nothing here has been
implemented — treat checkboxes as a future implementation's task list, not a
status report.

Two validator shapes recur throughout; naming them once so each section can
just reference them:

- **Format check (sync, `onChange` or `onBlur`, no network):** regex/length
  rules — email shape, phone shape, min/max. Cheap, should fire on every
  keystroke or at worst on blur. Already the norm in this gallery.
- **Existence/conflict check (async, `onBlurAsync`, network):** "does this
  value already exist / is it valid server-side" — email taken, username
  taken, slug taken, API key name taken. Expensive, must be debounced, and
  **must fire on blur, not on every keystroke** — the user asked for exactly
  this ("we do errors onBlur so user don't go to save/confirm button before
  fixing"). `billing.couponCode` is the only field doing this correctly today.

---

## 2. OB-0 — Cross-cutting fixes (shared infra, do first)

### OB-0a — `EXC_TO_SURFACE` is missing 8 of the backend's 18 real exception codes

**File:** `next-js-boilerplate/src/lib/exception-handler.ts:3-35`

Backend's actual registry (`nest-js-boilerplate/src/common/exceptions/exception-code.ts`)
has 18 `ExceptionCode` values. The frontend redeclares its own 10-value union
and `EXC_TO_SURFACE` map, independently, and it has drifted:

| Backend code (real) | In frontend's `EXC_TO_SURFACE`? | Consequence today |
|---|---|---|
| `EX_PROFILE_USERNAME_TAKEN` | ❌ missing | Falls back to `"toast"` + `console.warn`. Real code, thrown by `profile.service.ts:44` on a race-condition conflict. Should be `"form-field"` — the backend already sends `field: 'username'`. |
| `EX_API_KEY_NAME_EXISTS` | ❌ missing | Same fallback. Should be `"form-field"` targeting the `name` input (see OB-2). |
| `EX_API_KEY_NOT_FOUND` | ❌ missing | Fallback OK here (`"toast"` is a reasonable default for a 404 on an action button), but should be explicit rather than silently relying on the warn-and-fallback path. |
| `EX_API_KEY_INVALID` | ❌ missing | Same as above. |
| `EX_AUTH_ACCOUNT_INACTIVE`, `EX_AUTH_INVALID_TOKEN`, `EX_AUTH_WEAK_PASSWORD`, `EX_AUTH_MFA_*` (3) | ❌ missing | Outside forms-gallery scope (auth pages), flagging for completeness since it's the same map. |
| `EX_CONFLICT_FOREIGN_KEY`, `EX_CONFLICT_RELATION`, `EX_INCONSISTENT_DATA` | ❌ missing | Outside forms-gallery scope. |

**Proposed fix:** add the missing entries to `ExceptionCode` and
`EXC_TO_SURFACE` in `exception-handler.ts`. Minimum for this doc's scope:

```
EX_PROFILE_USERNAME_TAKEN: "form-field",
EX_API_KEY_NAME_EXISTS:    "form-field",
EX_API_KEY_NOT_FOUND:      "toast",
EX_API_KEY_INVALID:        "toast",
```

Once this lands, `error-lab`'s `real-unmapped-field` / `real-unmapped-toast`
scenarios (`src/lib/forms/error-scenarios.ts:71-85`) stop demonstrating a gap
and start demonstrating the fixed behavior — rename them
`profile-username-conflict` / `api-key-name-conflict` at the same time so the
lab's own labels don't lie (mirrors the "badge must not lie" lesson already
recorded for this gallery in the archived `form-implementations.md` register).

### OB-0b — No shared helper for "onBlurAsync backend check → field error"

Every field that needs an existence check currently hand-rolls its own
try/catch around `simulateError`/a real server action (see `billing`'s
`handleCouponBlur`, `profile`'s inline `onChangeAsync`). Six new call sites
are proposed below (OB-1, OB-2, OB-4 ×2, OB-5, OB-6). Before writing all six,
extract the shared shape from `handleCouponBlur`
(`views/forms/billing/PageContent.tsx:67-101`) into one helper, e.g.
`src/lib/forms/blur-async-check.ts`, taking `(value, scenarioOrCheck, deps)`
and returning `string | undefined` for use as an `onBlurAsync` validator body.
Saves ~25 lines of duplicated try/catch per field and keeps the
toast-vs-field-surface branching in one place. **File to add:**
`src/lib/forms/blur-async-check.ts` (+ a co-located test, matching this
gallery's existing convention of testing `submitProfile`/`submitCheckout` as
plain functions).

---

## 3. Overview table — all 12 examples

| # | Example | Backend-checkable field(s) today | onBlur backend check today? | Verdict |
|---|---|---|---|---|
| 1 | Profile | `username` (real), `email` (none — not even a real field) | `username`: yes, but on `onChangeAsync` not blur. `email`: no check at all. | **Fix both** |
| 2 | API Key | `name` (real, via submit-time conflict) | No | **Add** |
| 3 | Billing | `couponCode` (simulated) | **Yes — reference pattern** | `taxId` needs format check |
| 4 | Checkout | `postalCode` (simulated), `phone` (none) | postalCode: submit-time only. phone: no check at all. | **Fix both** |
| 5 | Team Invite | `emails[]` (simulated "already a member") | No — only fires once, on final submit, on a hardcoded index | **Fix** |
| 6 | Content Editor | `slug` (none — no backend concept yet) | No | **Add (needs new scenario)** |
| 7 | Editable Table | row `quantity`/`unitPrice` (simulated "row rejected") | Submit-time only (`Save All`), hardcoded row index | **Fix** |
| 8 | Field States | N/A — teaching page | Demonstrates eager/classic/dynamic, **not** async-backend | **Add a 4th demo card** |
| 9 | Filters | none — URL state only | N/A | **Out of scope, confirmed intentional** |
| 10 | Form Builder | none — client-only config generator | N/A | **Out of scope**, 1 adjacent bug noted |
| 11 | Uploads | file type/size (real, proxy + backend) | Already correct (drag/drop level, not a text field) | **No change** |
| 12 | Error Lab | N/A — it *is* the error-surface tester | N/A | **Add 1 scenario, low priority** |

---

## 4. OB-1 — Profile

**Files:** `views/forms/profile/PageContent.tsx`, `validators/forms/profile.ts`,
`messages/{en,tr}/forms/messages.json`, `api/client/profile/actions.ts`,
`api/server/profile/*` (backend prerequisite only, see below).

### a) `email` — no check exists, sync or async

**Current state:** `PageContent.tsx:159-164`. Validator is
`{ onChange: fieldSchemas.email }` — `createProfileFieldSchemas` in
`validators/forms/profile.ts:56` is just `z.string().email(...)`, a format
check. There is **no async call of any kind** on this field.

**Why it can't be "email already exists" today:** the real backend
`UpdateProfileInput` (`nest-js-boilerplate/src/profile/dto/update-profile.input.ts`)
has no `email` field at all — `updateProfile` only persists
`name/username/bio/avatarUrl/locale/timezone`. The gallery's `email` input is
cosmetic (confirmed in the already-shipped forms audit). So "check with
backend if that email exists" has two honest options:

- **Option A (recommended for the demo gallery):** wire `email` through the
  existing `simulateError` infra, same tier as `couponCode`/`slug` below — add
  a `profile-email-taken` scenario to `error-scenarios.ts` (`exc:
  "EX_AUTH_EMAIL_TAKEN"`, reusing the real auth exception code and its
  existing `auth.errors.emailTaken` message key so the copy is consistent with
  the real registration flow), and give `email`'s validator an `onBlurAsync`
  that calls it, mirroring `handleCouponBlur`.
- **Option B (real fix, bigger, backend work):** add `email` (with a
  verification-required flow, since changing a verified email is a real
  security-sensitive action) to the real `UpdateProfileInput` +
  `ProfileService.updateProfile`, with a uniqueness check identical in shape
  to `isUsernameAvailable` (`profile.service.ts:16-27`). Out of scope for a
  docs-only forms-gallery pass — flagging as the backend prerequisite if this
  ever stops being a demo field.

This doc proposes **Option A** for the gallery itself; Option B is a note for
whoever owns real account-settings work next.

**Proposed fix — file changes:**
- `validators/forms/profile.ts`: no schema change needed (format check stays).
- `views/forms/profile/PageContent.tsx:159-164`: replace the `onChange`-only
  validator with:
  ```
  validators={{
    onChange: fieldSchemas.email,
    onBlurAsyncDebounceMs: 300,
    onBlurAsync: async ({ value }) => {
      if (!value || !fieldSchemas.email.safeParse(value).success) return undefined;
      return blurAsyncCheck(value, "profile-email-taken", { simulateError, toast, allMessages });
    },
  }}
  ```
  (guard on `safeParse` first so the async call never fires on a
  format-invalid value — no point round-tripping "not-an-email" to the
  server).
- `src/lib/forms/error-scenarios.ts`: add
  ```
  {
    id: "profile-email-taken",
    status: 409,
    exc: "EX_AUTH_EMAIL_TAKEN",
    key: "auth.errors.emailTaken",
    msg: "Email is already registered",
    field: "email",
  }
  ```
- No new i18n key needed — `auth.errors.emailTaken` already exists in both
  locales.

### b) `username` — real check exists, wrong trigger

**Current state:** `PageContent.tsx:143-157`. `onChangeAsyncDebounceMs: 500`
+ `onChangeAsync` calling the **real** `checkUsername` →
`checkUsernameAvailableServer` → backend `isUsernameAvailable` GraphQL query
(`profile.service.ts:16-27`). This is the one genuinely real, working,
backend-checked field in the whole gallery — it just fires on every keystroke
(debounced) instead of on blur.

**Why this matters (not just style):** the user's stated UX goal is "we do
errors onBlur so user don't go to save/confirm button before fixing those
errors" — i.e., validation timing should match *intent to move on*, not
*every character typed*. Debounced `onChangeAsync` still fires mid-typing
(e.g. after typing "john_d" and pausing 500ms, before finishing "john_doe"),
which can show a spurious "taken" for a half-typed name and burns a real
network round-trip per pause, not per field visit.

**Proposed fix:** change the validator key from `onChangeAsync` +
`onChangeAsyncDebounceMs` to `onBlurAsync` + `onBlurAsyncDebounceMs` at
`PageContent.tsx:145-153`. Debounce can drop to ~150ms (blur already means
"done typing"; the debounce here is just to coalesce a blur→refocus→blur
flicker, not to wait out keystrokes). Also surface the existing-but-unused
`t.profile.usernameChecking` / `usernameAvailable` copy while validating —
today `FormFieldInfo` only shows the spinner + error, never the positive
"Available" state that the real `settings/account` page
(`views/settings/account/FreePageView.tsx:227-237`) already shows. Either
extend `FormFieldInfo` to accept an optional "success" slot, or keep it
simple and render the available-state span next to `field.TextField` the same
way the real settings page does.

**Files touched:** `views/forms/profile/PageContent.tsx` only (no new i18n —
`usernameChecking`/`usernameAvailable`/`usernameTaken` already exist in both
locales and are already unused-but-present, per commit `ae4e3a9`'s fixed-item
list).

### c) OB-0a dependency

Once `EX_PROFILE_USERNAME_TAKEN` is mapped to `"form-field"` (OB-0a), the
race-condition path — user A and user B both pass the async blur-check for
the same free username, user B submits second — correctly lands the error on
the `username` field via `exceptionToFormErrors` instead of a toast. No
additional profile-side change needed; this is purely unblocked by OB-0a.

---

## 5. OB-2 — API Key

**Files:** `views/forms/api-key/PageContent.tsx`, `api/client/api-keys/query.ts`
(read only, no edits — reuse its cache).

### `name` — zero validation, sync or async, despite a real conflict existing

**Current state:** `PageContent.tsx:215-222`. `form.AppField name="name"` has
**no `validators` prop at all**. The only feedback path is: submit → backend
throws `EX_API_KEY_NAME_EXISTS` (real, `exc/key: apiKeys.errors.nameExists`
per `error-scenarios.ts:74-77`'s mirror of it) → today falls through
`getSurface`'s unmapped fallback to a toast (see OB-0a) instead of the field.

**Complex-validation angle (min/max):** there's also no length/charset limit
on the key name client-side; whatever the backend's real constraint is should
be mirrored as a sync `onChange` schema so the user sees "name too long"
instantly instead of after a round trip.

**Proposed fix — file changes:**
- `views/forms/api-key/PageContent.tsx:215-222`: add
  ```
  validators={{
    onChange: z.string().min(1, t.apiKey.nameRequired).max(60, t.apiKey.nameTooLong),
    onBlur: ({ value }) =>
      keys?.some((k) => k.name === value.trim())
        ? t.apiKey.nameExists
        : undefined,
  }}
  ```
  Note this needs **no new network call at all** — `keys` (from
  `apiKeyListQueryOptions()`, already loaded at the top of the component,
  `PageContent.tsx:48`) is the full list of the user's existing keys already
  sitting in the TanStack Query cache. A plain sync `onBlur` against
  already-fetched data gives the same UX as an async check for free. This is
  the cheapest possible instance of "check with backend on blur" — the data's
  already there, it just isn't being read.
- Once OB-0a lands, the real submit-time conflict (someone else's tab creates
  the same name a second before this one submits) correctly lands on `name`
  as a field error instead of a toast — no extra change needed here, same as
  OB-1c.

**New i18n keys (both locales), under `apiKey.*`:**

| Key | EN | TR |
|---|---|---|
| `apiKey.nameRequired` | "Key name is required" | "Anahtar adı gerekli" |
| `apiKey.nameTooLong` | "Key name must be 60 characters or fewer" | "Anahtar adı en fazla 60 karakter olabilir" |
| `apiKey.nameExists` | "You already have a key with this name" | "Bu ada sahip bir anahtarınız zaten var" |

---

## 6. OB-3 — Billing

**Files:** `views/forms/billing/PageContent.tsx`, `validators/forms/billing.ts`,
`messages/{en,tr}/forms/messages.json`.

### a) `couponCode` — already correct, no fix, cite as the reference

`PageContent.tsx:189-203` is the pattern every other section in this doc is
asking to be copied: `onBlurAsync` + `onBlurAsyncDebounceMs: 300`, guards on
empty value, checks the sync-known-good list first, only round-trips for
values it doesn't already recognize, and correctly branches toast vs.
field-surface via `getSurface`. **No change proposed.**

### b) `taxId` — zero validation despite being a real-world format-sensitive field

**Current state:** `PageContent.tsx:207-214`. No `validators` prop at all.
`billingSchema.taxId` in `validators/forms/billing.ts:8` is
`z.string().optional()` — accepts literally anything, including
`"asdf"`.

**Complex-validation angle:** tax/VAT IDs have real per-country structure
(e.g. EU VAT: 2-letter country prefix + 8-12 digits). Memory confirms there's
no real backend tax-ID feature yet (demo-only field), so this is a
**format-only, client-side, no-network** fix — no backend/simulate scenario
needed, just a regex tightened enough to catch obvious garbage without being
so strict it rejects a real VAT number the demo can't fully enumerate.

**Proposed fix:**
- `validators/forms/billing.ts:8`: change to
  ```
  taxId: z.string().regex(/^[A-Z]{2}[A-Z0-9]{2,13}$/, t.taxIdInvalid ?? "Invalid tax ID format").optional().or(z.literal("")),
  ```
  (optional-or-empty since the field itself is optional; the regex only
  applies once the user types something).
- `views/forms/billing/PageContent.tsx:207-214`: add
  `validators={{ onBlur: fieldSchemas.taxId }}` — sync, blur-timed per the
  user's stated preference (don't flag "AB" as invalid while they're still
  typing "AB123456789").
- `createBillingFieldSchemas` (`validators/forms/billing.ts:11-18`): add the
  `taxId` entry alongside `plan`/`billingPeriod`.

**New i18n key:**

| Key | EN | TR |
|---|---|---|
| `billing.taxIdInvalid` | "Tax ID format looks wrong — expect a 2-letter country code followed by 2–13 digits/letters" | "Vergi numarası formatı hatalı görünüyor — 2 harfli ülke kodu ve ardından 2–13 rakam/harf bekleniyor" |

---

## 7. OB-4 — Checkout

**Files:** `views/forms/checkout/PageContent.tsx`, `validators/forms/checkout.ts`,
`messages/{en,tr}/forms/messages.json`, `src/lib/forms/error-scenarios.ts`.

### a) `phone` — zero validation, the field the user named explicitly

**Current state:** `AddressGroup` inner render, `PageContent.tsx:68-70`. Bare
`field.TextField` with no `validators` prop. `checkoutSchema`'s
`shippingAddress.phone` / `billingAddress.phone`
(`validators/forms/checkout.ts:24,34`) are both `z.string().optional()` —
again, accepts anything, including empty-string-adjacent garbage like `"abc"`.

**Proposed fix (sync format check, no backend needed — phone *format* is
locale/country data, not a lookup):**
- `validators/forms/checkout.ts`: replace both `phone: z.string().optional()`
  lines with
  ```
  phone: z.string().regex(/^\+?[0-9()\-.\s]{7,20}$/, t.phoneInvalid ?? "Invalid phone number").optional().or(z.literal("")),
  ```
  This is intentionally loose (digits, spaces, `()`, `-`, `.`, optional
  leading `+`, 7–20 chars) rather than a strict E.164 parser — there is no
  `libphonenumber`-class dependency anywhere in this repo today (checked); a
  proper per-country parser is a separate, larger dependency decision, not a
  one-field fix. Note that as its own follow-up if stricter validation is
  wanted later.
- `PageContent.tsx:68-70`: add
  `validators={{ onBlur: schemas.phone }}` (new `schemas` object passed into
  `AddressGroup`, mirroring how `fieldSchemas` is threaded into other pages —
  today `AddressGroup` receives no validators at all for any of its 6
  fields, see (c) below).

**New i18n key:**

| Key | EN | TR |
|---|---|---|
| `checkoutTab.phoneInvalid` | "Enter a valid phone number" | "Geçerli bir telefon numarası girin" |

### b) `email`/`confirmEmail` mismatch — checked on every keystroke, not blur

**Current state:** `PageContent.tsx:122-134` (form-level `onChange`) and
`PageContent.tsx:209-225` (field-level `onChangeListenTo` + `onChange` on
`confirmEmail`). Both fire the mismatch error while the user is still mid-typing
the second email — e.g. typing "a" into `confirmEmail` against
`email="alice@x.com"` immediately shows "Emails must match" one character in.

**Proposed fix:** change both to `onBlur`/`onBlurListenTo` equivalents (the
field-level one is a straight key rename: `onChangeListenTo` →
`onBlurListenTo`, `onChange` → `onBlur`, at `PageContent.tsx:212-219`; the
form-level guard at `:122-134` should move its check into the `confirmEmail`
field's own `onBlur` instead of a form-wide `onChange`, since the form-level
`onChange` fires on *every* field's every keystroke, not just these two).

### c) `postalCode` — real-shaped backend simulation, but submit-time only

**Current state:** `submitCheckout`, `PageContent.tsx:92-97`: `"00000"` in
`shippingAddress.postalCode` triggers `simulateError("postal-code-group")`
**only when the whole form is submitted**. The scenario itself
(`error-scenarios.ts:123-130`) is already correctly shaped for field-level
targeting (`field: "billingAddress.postalCode"`) — the infra is fine, the
trigger point is the problem, exactly the pattern this whole doc is about.

**Proposed fix:**
- Add `validators={{ onBlurAsync: ..., onBlurAsyncDebounceMs: 300 }}` to both
  `shippingAddress.postalCode` and `billingAddress.postalCode` fields inside
  `AddressGroup` (`PageContent.tsx:48-50`), calling `simulateError` with a
  group-aware scenario id (reuse `"postal-code-group"` for billing,
  `"validation-form-field"` for shipping — both already exist and already
  target the right field paths) whenever the value is `"00000"`.
- Keep the submit-time check too (defense in depth is fine — the point is
  the user should never *need* to reach Submit to find out, not that Submit
  stops re-checking).

### d) `AddressGroup` fields have no sync validation at all

**Current state:** `street`/`city`/`province` (`PageContent.tsx:37-50`) render
via bare `group.AppField` with no `validators` prop, even though
`checkoutSchema` already defines `min(1, ...)` rules for all three
(`validators/forms/checkout.ts:17-19,27-29`). The schema exists and is simply
never wired to the fields — it's only used as the `onSubmitAsync` shape via
`z.input<typeof checkoutSchema>` for typing, never as a live field validator.

**Proposed fix:** thread the three schemas into `AddressGroup` the same way
`fieldSchemas` is threaded elsewhere in this gallery — add
`validators={{ onBlur: schemas.street }}` etc. to each. Trivial, but currently
completely absent, so a user can submit a checkout with an empty street and
only find out at the very end.

---

## 8. OB-5 — Team Invite

**Files:** `views/forms/team-invite/PageContent.tsx`, `src/lib/forms/error-scenarios.ts`,
`messages/{en,tr}/forms/messages.json`.

### a) `emailInput` bypasses TanStack validators entirely — and fails silently

**Current state:** `PageContent.tsx:182-219`. This is a raw `<Input>` with
manual `onChange`/`onKeyDown`, not a `form.AppField` with a `validators` prop
— it can't participate in the field-error system at all. Worse: on Enter or
clicking "Add" (`:190-199`, `:206-213`), if the trimmed value fails
`EMAIL_RE.test()` or is already in the `emails` array, the handler just
`return`s. **Nothing happens and nothing is shown** — the input doesn't
clear, no error appears, there's no toast. A user who fat-fingers an email
and hits Enter has no idea why their chip didn't appear. This is a plain bug,
not just a missing backend check — flagging distinctly from the "no backend
check" pattern the rest of this doc covers, because this one is UX-invisible.

**Proposed fix:**
- Add local state (or a tiny `useState<string | null>`) for an inline error
  string, rendered right under the input (same visual slot `FormFieldInfo`
  uses elsewhere in this gallery, for consistency).
- On invalid format: set `t.teamInvite.emailInvalid` (already exists).
- On duplicate: set `t.teamInvite.emailDuplicate` (already exists — also
  currently unused! Same "message exists, never rendered" pattern as OB-1b's
  `usernameChecking`/`usernameAvailable`).
- Clear the error on successful add or on next keystroke.

### b) "Already a member" check — real-shaped, but fixed to array index 2, and submit-time only

**Current state:** `submitTeamInvite`, `PageContent.tsx:60-73`. Calls
`simulateError("invite-email-member")` unconditionally at submit; the
scenario (`error-scenarios.ts:87-93`) hardcodes `field: "emails.2"` — i.e. it
always claims the **third** email chip is the conflicting one, regardless of
which email is actually a duplicate member. This only works as a demo because
it always targets index 2; it isn't a real per-email check.

**Proposed fix:** move the "is this email already a member" check to the
moment an email is *added* (Enter / Add button, `PageContent.tsx:190-199,
206-213`), as an async call keyed to the specific email just entered — not a
blanket end-of-form check. Since there's no real team-members-by-email
backend feature (confirmed: the real resolver is join-by-UUID, semantically
unrelated), this stays simulate-only: add a new scenario
`invite-email-member-check` parameterized... but `ERROR_SCENARIOS` entries
are static, so instead pass the specific email being checked through
`simulateError`'s existing `opts` and have the route match against a small
hardcoded demo list (e.g. `"taken@example.com"` always conflicts) rather than
against a fixed array index. This keeps the "backend round trip on blur/add"
shape without depending on chip position.

**New i18n key:** none needed — `emailAlreadyMember` already exists.

### c) `role` uses `onChange`, not `onBlur`

**Current state:** `PageContent.tsx:251-254`. Minor — a `RadioGroupField`
technically doesn't have a meaningful "typing" state the way a text input
does (a radio selection *is* a discrete, complete action), so `onChange` here
is arguably already correct, unlike text fields. No fix proposed; noted so
it's clear this was checked, not missed.

---

## 9. OB-6 — Content Editor

**Files:** `views/forms/content-editor/PageContent.tsx`, `validators/forms/editor.ts`,
`src/lib/forms/error-scenarios.ts`, `messages/{en,tr}/forms/messages.json`.

### `slug` — format-checked only, no uniqueness check ever

**Current state:** `PageContent.tsx:311-316`. `onChange: editorSchemas.shape.slug`
is a regex (`/^[a-z0-9-]+$/`) — shape only. Real CMS/blog editors need
"this slug is already used by another post" feedback before publish, and this
gallery has no such check at any point, including submit.

**Proposed fix:** since there's no real content/draft backend (confirmed —
demo-only), add a new scenario:
```
{
  id: "content-slug-taken",
  status: 409,
  exc: "EX_CONFLICT_DUPLICATE",
  key: "forms.errors.slugTaken",
  msg: "This slug is already in use",
  field: "slug",
}
```
and wire `slug`'s validator to
`onBlurAsync` calling it whenever the value matches a small hardcoded
"already used" demo list (mirrors the coupon pattern: a known-bad set checked
client-side first, falling through to the simulated network call only for
values not already known). Skip the check entirely while
`slugEditedByUser.current` is `false` (i.e. while the slug is still being
auto-derived from the title on every keystroke, `PageContent.tsx:164-169`) —
only check once the user has actually left the field after editing it
directly, otherwise every keystroke in the title would indirectly trigger a
slug re-check.

**New i18n key:**

| Key | EN | TR |
|---|---|---|
| `forms.errors.slugTaken` | "This slug is already in use — try a different one" | "Bu kısa bağlantı zaten kullanılıyor — başka bir tane deneyin" |

---

## 10. OB-7 — Editable Table

**Files:** `views/forms/editable-table/PageContent.tsx`, `validators/forms/table.ts`,
`src/lib/forms/error-scenarios.ts`.

### Per-row fields — sync min/max exist, but the one "backend" check is submit-time and index-fixed

**Current state:** `quantity`/`unitPrice`/`description`/`taxClass` all have
sync `onChange` validators from `createTableRowFieldSchemas`
(`validators/forms/table.ts:21-27`) — this part is already fine, a good
example of format/range validation done right (min quantity, non-negative
price). The gap is the same shape as OB-5b: `"row-rejected"`
(`error-scenarios.ts:132-138`) hardcodes `field: "rows.3.quantity"` — always
row index 3, regardless of which row the user is actually editing or saving.
`handleSaveAll` (`PageContent.tsx:106-115`) calls it but **discards the
result** — the `catch` block shows the same success toast as the `try` block,
so the simulated rejection is currently unreachable in practice (dead code
path, not just mistimed).

**Complex-validation angle (min/max):** `quantity`'s `min(1, ...)` and
`unitPrice`'s `min(0, ...)` are the clearest existing "min/max" examples in
the whole gallery and are already correct — cite as reference alongside
`billing.couponCode`, not a fix target.

**Proposed fix:**
1. Fix `handleSaveAll`'s `catch` block to actually surface the rejection
   (`toast({ description: exceptionHandler(...), variant: "destructive" })`)
   instead of silently showing success — this is a plain bug independent of
   the onBlur question.
2. Add a per-row `onBlurAsync` on `quantity` (the field most likely to have a
   real server-side constraint, e.g. "exceeds available stock") that calls
   `simulateError("row-rejected", ...)` for the specific row index being
   blurred, rather than only at "Save All" time against a fixed index —
   change the scenario's `field` to be computed by the caller
   (`rows[${i}].quantity`) rather than baked into the static scenario object.

No new i18n key — `rowRejected` already exists.

---

## 11. OB-8 — Field States

**File:** `views/forms/field-states/PageContent.tsx`.

This page is the gallery's validation-timing reference (`EagerForm` =
`onChange`, `ClassicForm` = `onBlur`, `DynamicForm` = `revalidateLogic({mode:
"blur"})`). It's exactly the right place to also demonstrate the
**async-backend-on-blur** pattern this whole doc is about — right now it's
absent, so a developer using this page as a reference would never learn the
pattern exists.

**Proposed fix:** add a 4th `StateCard` next to `EagerForm`/`ClassicForm`/
`DynamicForm` inside `ValidationModesSection`
(`PageContent.tsx:242-271`), e.g. `AsyncCheckedForm`, with one field whose
`validators` use `onBlurAsync` + `onBlurAsyncDebounceMs` against a trivial
simulated "checking a reserved-words list" call, showing the `isValidating`
spinner (`FormFieldInfo` already renders this — no component change needed)
followed by either an error or nothing. Caption: "Checked against the server
on blur" to sit alongside the existing "Validates on every keystroke" /
"Validates only on blur" / "Quiet until first blur, then live" captions.

---

## 12. OB-9 — Filters (N/A)

**File:** `views/forms/filters/PageContent.tsx`. Every field here writes
straight to the URL query string (`onChange` handler at `PageContent.tsx:94-112`
does `window.history.replaceState`, nothing else). There is no submit, no
persisted entity, and nothing for a backend to conflict-check — "search" and
date-range filters aren't the kind of field that can be "taken" or "invalid"
in a backend sense. Confirmed out of scope; listed here so it's clear this
page wasn't skipped by omission.

---

## 13. OB-10 — Form Builder (N/A, one adjacent bug noted)

**File:** `views/forms/form-builder/PageContent.tsx`. This tab generates a
throwaway client-side config (dynamic form preview), persists nothing, and
has no backend counterpart — out of scope for "onBlur backend checks" by the
same logic as OB-9.

**Adjacent bug worth a one-line mention (not a validation-timing issue, so
not numbered as its own OB item):** `sanitizeFieldName`
(`PageContent.tsx:29-35`) never checks the newly generated name against the
*other* fields already in `fields` — two fields both labeled "New Field" (the
default label used by "Add Field", `PageContent.tsx:87-100`) silently
collide on the same `name: "NewField"`, so their preview inputs share state.
Fix (whenever this tab is next touched, not part of this doc's scope) is to
pass the existing `fields` list into `sanitizeFieldName` and append a numeric
suffix on collision, same idea as `UsernameService`'s collision retry on the
backend.

---

## 14. OB-11 — Uploads (N/A, already correct)

**File:** `views/forms/uploads/PageContent.tsx`. Avatar/gallery uploads
already go through the real backend (`uploadAvatar`, `uploadWithProgress`)
with real size/type constraints enforced client + proxy + backend (5 MB
proxy vs. 10 MB backend, per the standing memory note — client already binds
to the stricter 5 MB via `MAX_UPLOAD_SIZE`). This isn't a text-field
"onBlur" scenario — file drop/selection is the equivalent trigger point, and
it's already wired correctly. The document-upload section's failure message
(`PageContent.tsx:48-56`) is an intentional, correctly-labeled simulation
("the backend only accepts images"), not a gap.

---

## 15. OB-12 — Error Lab

**File:** `views/forms/error-lab/PageContent.tsx`. This page exists to
manually trigger every scenario in `ERROR_SCENARIOS` against every surface/
locale/network combination — it's the test harness, not itself a form with
fields to validate.

**Low-priority addition:** once OB-1 through OB-7 add their new scenario ids
(`profile-email-taken`, `content-slug-taken`, the parameterized
`invite-email-member-check`, the per-row `row-rejected`), they automatically
appear in this page's scenario dropdown (`GROUPS`/`surfaceGroups`,
`PageContent.tsx:17-22,175-178`) with zero code change — the lab reads from
the shared `ERROR_SCENARIOS` array. No fix needed here beyond what OB-0
through OB-7 already add.

---

## 16. i18n additions — full key list

All additions below need both `messages/en/forms/messages.json` and
`messages/tr/forms/messages.json` (this gallery currently has full 310/310
key parity between locales — every addition must land in both files in the
same commit to keep it that way).

| Key | EN | TR | Used by |
|---|---|---|---|
| `apiKey.nameRequired` | Key name is required | Anahtar adı gerekli | OB-2 |
| `apiKey.nameTooLong` | Key name must be 60 characters or fewer | Anahtar adı en fazla 60 karakter olabilir | OB-2 |
| `apiKey.nameExists` | You already have a key with this name | Bu ada sahip bir anahtarınız zaten var | OB-2 |
| `billing.taxIdInvalid` | Tax ID format looks wrong — expect a 2-letter country code followed by 2–13 digits/letters | Vergi numarası formatı hatalı görünüyor — 2 harfli ülke kodu ve ardından 2–13 rakam/harf bekleniyor | OB-3 |
| `checkoutTab.phoneInvalid` | Enter a valid phone number | Geçerli bir telefon numarası girin | OB-4 |
| `forms.errors.slugTaken` | This slug is already in use — try a different one | Bu kısa bağlantı zaten kullanılıyor — başka bir tane deneyin | OB-6 |

Everything else referenced in this doc (`auth.errors.emailTaken`,
`profile.usernameChecking/usernameAvailable/usernameTaken`,
`teamInvite.emailInvalid/emailDuplicate`, `errors.emailAlreadyMember`,
`errors.postalCodeInvalid`, `errors.rowRejected`) **already exists in both
locales** — several are currently defined but never rendered (OB-1b, OB-5a);
those are wiring fixes, not new copy.

---

## 17. Suggested implementation order

1. **OB-0a** (`EXC_TO_SURFACE` gap) — unblocks correct field-vs-toast
   behavior for every other item below that has a *real* backend conflict
   (OB-1c, OB-2). Zero risk, additive-only change to a lookup map.
2. **OB-0b** (shared `blurAsyncCheck` helper) — do before writing OB-1a,
   OB-4c, OB-5b, OB-6, since they'd otherwise each duplicate
   `handleCouponBlur`'s try/catch shape.
3. **OB-2** (API key name) — cheapest fix in this doc (no network call
   needed, data's already cached) and fixes a real, currently-silent bug
   path (unmapped exception → toast instead of field).
4. **OB-1b** (username → `onBlurAsync`) — one-line trigger change plus
   surfacing already-existing unused copy; no new i18n.
5. **OB-4a/b/d** (checkout phone + email-mismatch timing + address group
   sync validators) — all sync-only, no backend/network involved, lowest
   risk.
6. **OB-5a** (silent-failure bug on invalid/duplicate email chip) — not
   about backend timing at all, but the most user-visible bug in this
   audit (a control that does nothing with no feedback); fix independent
   of everything else.
7. **OB-1a, OB-3b, OB-4c, OB-5b, OB-6, OB-7** — the genuine new
   onBlurAsync-backend-check wiring, in any order; each is isolated to one
   example.
8. **OB-8** (Field States 4th demo card) — documentation/teaching value only,
   do last.

---

## 18. UX-0 — Cross-cutting "even a child can fill this" fixes

Sections 1–17 audit *when* a check happens (blur vs. change vs. submit).
This section audits something different: sat down and filled out all 12
examples end-to-end as a first-time user with no prior context — no reading
the source first, no knowing the format rules in advance. Every point below
is somewhere that guess would have been wrong, or a control gave no clue
what it does. None of this is about backend checks; it's about never
needing an error at all because the form told you the rule up front. Same
rule as sections 1–17: **docs only, nothing implemented.**

### UX-0a — "Required" is real in exactly one place, and it's the demo

**Files:** `features/forms/ui/TextField.tsx:9-27`,
`components/ui/label/label.tsx:4-21`, all 12 `PageContent.tsx` files.

`Label`'s `required` prop renders a red `*` — but it's marked
`aria-hidden="true"` (`label.tsx:15`), so a screen reader announces nothing
extra; the asterisk is sighted-users-only. Worse, `TextField` never forwards
`required` to the actual `<Input>` (`TextField.tsx:18-23` passes only `id`,
`value`, `onBlur`, `onChange` — no `required`/`aria-required`), so even the
native browser's own required-field affordance never fires.

And the prop is barely used at all: across every real field in all 12
examples (`firstName`, `lastName`, `username`, `email` in Profile; `street`/
`city`/`province`/`postalCode`/`paymentMethod` in Checkout; `plan` in
Billing; `role` in Team Invite — all of them backed by a `min(1)`/`.email()`
schema, i.e. *actually* required) — the only place `required` is ever passed
is `field-states/PageContent.tsx:138`, and that's the teaching page showing
what the required *state* looks like, not a real form using it. A first-time
user has no visual cue which fields are mandatory until they submit and get
told.

**Proposed fix:**
1. `TextField.tsx`: forward `required` to the `<Input>` as both `required`
   and `aria-required={required}`.
2. Pass `required` on every field in every example backed by a non-optional
   schema (the list above) — this is a one-line addition per field, not a
   redesign; do it in the same commit as whichever OB item touches that
   field, or as its own pass across all 12 files.

### UX-0b — Icon-only controls have no accessible name and no touch affordance

**Files:** `views/forms/editable-table/PageContent.tsx:261-301`,
`views/forms/api-key/PageContent.tsx:272-278`,
`views/forms/team-invite/PageContent.tsx:227-234`.

Grepped all 12 `PageContent.tsx` files for `aria-label`: **zero matches.**
Every icon-only button relies on a bare Unicode glyph plus, at best, a
`title` attribute:

| Glyph | File:line | `title` present? | What it does |
|---|---|---|---|
| `⧉` | `editable-table/PageContent.tsx:259-271` | `t.editableTable.duplicateRow` | Duplicates the row |
| `↑` / `↓` | `editable-table/PageContent.tsx:272-287` | `t.editableTable.moveUp`/`moveDown` | Reorders rows |
| `×` (row) | `editable-table/PageContent.tsx:288-294` | `t.editableTable.removeRow` | Deletes the row, no confirm (see UX-0c) |
| `✓` | `editable-table/PageContent.tsx:295-301` | `"Save row"` (hardcoded literal, see UX-0e) | Marks row saved |
| `×` (IP chip) | `api-key/PageContent.tsx:273-279` | none | Removes an IP from the whitelist |
| `×` (email chip) | `team-invite/PageContent.tsx:228-234` | none | Removes an invite email |

`title` only ever shows on desktop mouse hover — it does nothing on touch
(the primary input for a large share of real users, and the harder case for
"even a child can use this"), and screen readers don't reliably announce it
either. The four `editable-table` buttons already have the right *string*
sitting right there as a `title` — they're just missing the second prop
that actually makes it accessible/touch-safe. The two chip-remove `×`
buttons have **no affordance at all** beyond the glyph itself, not even a
`title`.

**Proposed fix:** add `aria-label` alongside the existing `title` on the
four `editable-table` buttons (literally
`aria-label={t.editableTable.duplicateRow}` etc. — copy the same string into
the new prop, zero new copy needed). For the two bare `×` chip buttons, add
both `title` and `aria-label` using new copy (see UX-2 table below).

### UX-0c — Irreversible actions have no confirmation step

**Files:** `views/forms/api-key/PageContent.tsx:133-139` (`handleRevoke`),
`views/forms/editable-table/PageContent.tsx:288-294` (row delete),
`views/forms/content-editor/PageContent.tsx:230-233` (`handleDiscard`).

- **Revoke API key:** one click on a `variant="destructive"` button
  immediately calls the mutation and shows a success toast — no "are you
  sure?" for an action that's explicitly irreversible (the secret was only
  ever shown once, per the gallery's own `secretNote` copy) and could break
  a live integration if clicked by mistake.
- **Delete table row:** same — instant, no undo, no confirm.
- **Discard draft:** `handleDiscard` wipes `localStorage` immediately; the
  surrounding UI (`draftAlert` banner, `PageContent.tsx:259-276`) already
  has a `Discard`/`Restore` button pair sitting side by side — a slow double
  click or a mis-tap on a small touch target picks the destructive one with
  zero recovery.

**Proposed fix:** for all three, either (a) a lightweight confirm (a second
click state on the button itself — "Click again to confirm", timed out
after a few seconds — cheapest to build, no new dependency), or (b) reuse
whatever confirm-dialog primitive already exists elsewhere in
`components/ui` if one does. Scope note: this doc doesn't audit
`components/ui` for an existing `AlertDialog`/`ConfirmDialog` — check before
building a new one.

### UX-0d — No persistent "what format do you want" hint; only reactive errors

**Files:** all 12, but concretely: `checkout` phone/postalCode
(`PageContent.tsx:68-70`, address fields), `billing.taxId`
(`PageContent.tsx:207-214`), `profile.username`
(`PageContent.tsx:143-157`), `content-editor.slug`
(`PageContent.tsx:311-316`).

The one field in the whole gallery that already gets this right is
`apiKey.namePlaceholder` = *"e.g. CI/CD, Development"*
(`messages/en/forms/messages.json`, wired at
`api-key/PageContent.tsx:218-221`) — a concrete example shown **before** the
user types anything, not a rule explained only after they get it wrong.
Every format-sensitive field this doc proposes a regex for in sections 1–17
(phone, tax ID, postal code, username, slug) currently shows nothing until
blur produces an error. A first-time user has to fail once to learn the
rule.

**Proposed fix (shared infra, do before the per-field copy in section 19):**
add an optional `hint` prop to `TextField` (`features/forms/ui/TextField.tsx`)
rendered as small muted text under the label, always visible, distinct from
`FormFieldInfo`'s error/validating slot (which only appears after
interaction). This mirrors the pattern `file-upload.tsx:289-293` already
uses for its "Accepted: …" caption — generalize it from files to text
fields. Section 19 below gives the exact hint copy per field.

### UX-0e — Hardcoded English strings bypass i18n entirely

Grepped all 12 files for literal UI copy outside `t.*`/`useMessages`. This
matters for "even a child can understand" specifically for the ~50% of this
app's users on the `tr` locale — a hardcoded string is not just a missed
translation, it's a sentence that locale's users can't read at all.

| File:line | Hardcoded string | Should be |
|---|---|---|
| `api-key/PageContent.tsx:242` | `"IP Whitelist (optional)"` | new key `apiKey.ipWhitelistLabel` |
| `api-key/PageContent.tsx:247` | `"Enter IP and press Enter"` | new key `apiKey.ipPlaceholder` |
| `api-key/PageContent.tsx:261-263` | `"Add"` (IP button) | new key `apiKey.addIp` (note: `t.apiKey.create`/other buttons already exist and are used correctly elsewhere in this same file — this one button was missed) |
| `api-key/PageContent.tsx:156` | `"Loading..."` | new key `common.loading` or reuse an existing shared loading string if one exists elsewhere in the app |
| `team-invite/PageContent.tsx:148` | `"Back"` (inside the `quotaExceeded` branch) | `{t.teamInvite.back}` — already used correctly two screens away at `PageContent.tsx:306`, just missed in this branch |
| `form-builder/PageContent.tsx:143` | `"Config copied to clipboard"` (toast) | new key `formBuilder.configCopied` |
| `form-builder/PageContent.tsx:199` | `"Field names: "` prefix | new key `formBuilder.fieldNamesLabel` |
| `form-builder/PageContent.tsx:239` | `"Untitled"` fallback | new key `formBuilder.untitledField` |
| `form-builder/PageContent.tsx:308` | `"Comma-separated"` placeholder | new key `formBuilder.optionsPlaceholder` |
| `editable-table/PageContent.tsx:139` | `"Net"` column header | new key `editableTable.net` |
| `editable-table/PageContent.tsx:305` | `"Saved"` badge | new key `editableTable.savedBadge` (note: `t.editableTable.saveSuccess` exists but is a different, longer toast string — this badge needs its own short word) |
| `editable-table/PageContent.tsx:298` | `title="Save row"` | new key `editableTable.saveRow` (the other four row-action buttons already use real `t.editableTable.*` keys for their `title` — this one was missed) |
| `image-upload/image-upload.tsx:107` | `"Invalid file type"` (toast title) | new key, shared across both upload components |
| `error-lab/PageContent.tsx` — nearly the whole file | `"Error & Async States Lab"`, `"Test every error surface and locale combination"`, `"Error Scenario"`, `"Locale"`, `"Network Condition"`, `"Triggering..."`/`"Trigger Error"`, `"Raw Payload"` (7+ strings, lines 183-249) | all need `t.errorLab.*` keys — this page never calls `useMessages("forms")` at all, only `useAllMessages()` for the *simulated* error copy. The one tab whose whole purpose is demonstrating locale-aware error handling has non-localized chrome around it. |

**Proposed fix:** add the keys above to both locale files (see section 20),
then swap each literal for its `t.*` reference. `error-lab` additionally
needs a `const t = useMessages("forms");` call added
(`error-lab/PageContent.tsx:132-134`, alongside the existing
`useAllMessages()`).

### UX-0f — File upload: size limit is never shown up front, only after rejection

**Files:** `components/ui/file-upload/file-upload.tsx:74-95,286-293`,
`components/ui/image-upload/image-upload.tsx:65-139`.

`file-upload.tsx` already does half of this right: the dropzone shows
`{labels.acceptedLabel}: {accept}` proactively (`:289-293`) — but `accept`
is the raw MIME string (`"image/*"`, `".pdf,.docx"`), not a human-readable
list ("JPG, PNG, GIF" / "PDF, Word"). The **size** limit only ever appears
reactively, inside the error message after a file is already rejected
(`:74-82`, using `humanSize(maxSizeBytes)` — the formatter exists, it's just
never called until after the mistake).

`image-upload.tsx`'s avatar widget (used by Profile and the Uploads tab) is
worse: **no hint of any kind**, ever — no accepted-types caption, no size
caption, reactive or proactive. Its only feedback is the toast on a wrong
file type (and that toast's title is hardcoded English, see UX-0e). It also
only reveals its "Change Photo" affordance on `:hover`
(`image-upload.tsx:96`, `opacity-0 ... hover:opacity-100`) — invisible by
default on any touch device, since there's no `:active`/`:focus-visible`
fallback in the class list.

**Proposed fix:**
1. `file-upload.tsx`: add a human-readable label map for common `accept`
   values (`image/*` → "Images", `.pdf,.docx` → "PDF, Word") instead of
   printing the raw MIME string; add a second proactive line showing the
   size cap, e.g. `Max {humanSize(maxSizeBytes)} per file`, next to the
   existing accepted-types line.
2. `image-upload.tsx`: add the same two proactive lines under the avatar
   circle. Change the "Change Photo" trigger's visibility classes to also
   show on `:focus-visible` (keyboard) and consider a small always-visible
   pencil/camera badge instead of relying on hover alone, since this is the
   one control in the gallery a touch-only user could fail to ever discover.

---

## 19. UX-1 — Per-field guidance copy, example by example

Concrete always-visible hint text to add once UX-0d's `hint` prop exists
(section 18). "EN" is the proposed copy; pair each with its own TR line in
section 20. Written the way a first-time user would want to read them —
short, concrete, one example beats three rules.

| Example | Field | Hint to show (always visible, before any error) |
|---|---|---|
| Profile | `username` | "3–30 characters: lowercase letters, numbers, and `_` only" |
| Profile | `email` | *(none needed — format is self-evident; keep error-only)* |
| Profile | `bio` | "Up to 500 characters" + a live `123/500` counter (see UX-0g below) |
| API Key | `name` | Already good (`"e.g. CI/CD, Development"`) — no change |
| API Key | IP whitelist input | "e.g. 203.0.113.42 — one address per line" (today's placeholder just says "press Enter", which is the mechanic, not the expected format; a user typing "office wifi" instead of an IP gets no pushback at all today — see UX-1 follow-up below) |
| Billing | `couponCode` | "Case-insensitive — try `SAVE10` or `WELCOME20`" (turns an opaque text box into something a new user can actually test) |
| Billing | `taxId` | "2-letter country code + 2–13 digits/letters, e.g. `GB123456789`" |
| Checkout | `phone` | "Include your country code, e.g. `+1 555 123 4567`" |
| Checkout | `postalCode` | "Format depends on the country selected above" |
| Team Invite | email input | "Press Enter or click Add after each address" (mechanic is already in the placeholder — keep, but pair with the new inline error from OB-5a so a rejected entry doesn't vanish silently) |
| Content Editor | `slug` | "Auto-generated from the title — edit here to customize the URL" (explains *why* it changes on its own, which is currently unexplained and could look like a bug to a first-time user typing a title and watching another field change) |
| Editable Table | `quantity` | "Whole numbers, 1 or more" |
| Editable Table | `unitPrice` | "Enter as a decimal, e.g. `19.99`" |

**Follow-up worth flagging on API Key's IP whitelist specifically:** there is
**no format validation at all** on this field today (`handleAddIp`,
`api-key/PageContent.tsx:141-147`, only checks non-empty and non-duplicate
— `"hello world"` is accepted as an "IP"). This is the same class of gap as
`checkout.phone` in OB-4a — recommend the same treatment: a sync
`onBlur`/`onKeyDown`-time regex (simple IPv4 dotted-quad check, optionally
CIDR suffix) before `handleAddIp` pushes the value into the chip list, with
a new i18n key `apiKey.ipInvalid` ("Enter a valid IPv4 address, e.g.
`203.0.113.42`" / TR: "Geçerli bir IPv4 adresi girin, örn. `203.0.113.42`").

### UX-1 (continued) — bounded fields with no counter

**Files:** `profile.bio` (max 500, `validators/forms/profile.ts:23`),
`team-invite.message` (max 1000, `validators/forms/invite.ts:19`),
`api-key.name` (proposed max 60 in OB-2).

None of these show remaining/used character count while typing — a user
only finds the cap by hitting it and getting an error (or, for `bio`/
`message`, which are optional with no sync validator wired to the field at
all today, by having their input **silently truncated or rejected at
submit** with no idea why). Proposed: a small `123/500` counter using the
same muted-text slot as UX-0d's hint (swap from static hint to live counter
once the user starts typing, same visual weight).

---

## 20. UX-2 — i18n additions for this pass

Same rule as section 16: every key below needs both
`messages/en/forms/messages.json` and `messages/tr/forms/messages.json` in
the same commit.

| Key | EN | TR |
|---|---|---|
| `apiKey.ipWhitelistLabel` | IP Whitelist (optional) | IP İzin Listesi (isteğe bağlı) |
| `apiKey.ipPlaceholder` | e.g. 203.0.113.42 — one address per line | örn. 203.0.113.42 — satır başına bir adres |
| `apiKey.addIp` | Add | Ekle |
| `apiKey.ipInvalid` | Enter a valid IPv4 address, e.g. 203.0.113.42 | Geçerli bir IPv4 adresi girin, örn. 203.0.113.42 |
| `apiKey.removeIp` | Remove IP address | IP adresini kaldır |
| `common.loading` | Loading… | Yükleniyor… |
| `formBuilder.configCopied` | Config copied to clipboard | Yapılandırma panoya kopyalandı |
| `formBuilder.fieldNamesLabel` | Field names: | Alan adları: |
| `formBuilder.untitledField` | Untitled | Başlıksız |
| `formBuilder.optionsPlaceholder` | Comma-separated | Virgülle ayrılmış |
| `editableTable.net` | Net | Net |
| `editableTable.savedBadge` | Saved | Kaydedildi |
| `editableTable.saveRow` | Save row | Satırı kaydet |
| `editableTable.quantityHint` | Whole numbers, 1 or more | Tam sayı, 1 veya daha fazla |
| `editableTable.unitPriceHint` | Enter as a decimal, e.g. 19.99 | Ondalık girin, örn. 19.99 |
| `uploads.invalidFileType` | Invalid file type | Geçersiz dosya türü |
| `profile.usernameHint` | 3–30 characters: lowercase letters, numbers, and `_` only | 3–30 karakter: küçük harf, rakam ve `_` |
| `profile.bioHint` | Up to 500 characters | En fazla 500 karakter |
| `billing.couponHint` | Case-insensitive — try SAVE10 or WELCOME20 | Büyük/küçük harf duyarsız — SAVE10 veya WELCOME20 deneyin |
| `billing.taxIdHint` | 2-letter country code + 2–13 digits/letters, e.g. GB123456789 | 2 harfli ülke kodu + 2–13 rakam/harf, örn. GB123456789 |
| `checkoutTab.phoneHint` | Include your country code, e.g. +1 555 123 4567 | Ülke kodunu ekleyin, örn. +90 555 123 4567 |
| `checkoutTab.postalCodeHint` | Format depends on the country selected above | Format, yukarıda seçilen ülkeye göre değişir |
| `contentEditor.slugHint` | Auto-generated from the title — edit here to customize the URL | Başlıktan otomatik oluşturulur — URL'yi özelleştirmek için buradan düzenleyin |
| `teamInvite.emailChipRemove` | Remove email | E-postayı kaldır |
| `errorLab.heading` | Error & Async States Lab | Hata ve Eşzamansız Durumlar Laboratuvarı |
| `errorLab.subheading` | Test every error surface and locale combination | Her hata yüzeyini ve dil kombinasyonunu test edin |
| `errorLab.scenarioLabel` | Error Scenario | Hata Senaryosu |
| `errorLab.localeLabel` | Locale | Dil |
| `errorLab.networkLabel` | Network Condition | Ağ Durumu |
| `errorLab.trigger` | Trigger Error | Hatayı Tetikle |
| `errorLab.triggering` | Triggering... | Tetikleniyor... |
| `errorLab.rawPayload` | Raw Payload | Ham Veri |

Note the TR value for `checkoutTab.phoneHint` uses a `+90` example instead
of `+1` — a small deliberate localization choice (Turkish country code)
rather than a literal translation of the English example, consistent with
how this gallery already localizes rather than transliterates elsewhere.

---

## 21. Rev 2 — Verification & fix guide

**2026-07-20.** Berkay reported this doc "finished" and asked for it to be
checked. Verified commit `60acca2` ("project-enhance-4: onBlur backend
checks & complex field validation") against every claim in §§1–20 by reading
each diffed file and **tracing the actual runtime logic** (schema defaults,
the `simulate-error` route handler, the `EXC_TO_SURFACE` map) rather than
only confirming a function with the right name exists — same standard as
`project-enhance-3.md`'s Rev 4 pass. Like Rev 1, this section is
**documentation only — nothing below has been fixed yet.** `pnpm typecheck`
and `pnpm lint` are both clean at `60acca2`; every issue below is a logic
bug or a missing wire-up, not something either gate catches.

### 21.1 Status table

| Item | Status | Detail |
|---|---|---|
| OB-0a (`EXC_TO_SURFACE` gap) | ✅ Done | Matches doc exactly; `real-unmapped-*` scenarios renamed as proposed. |
| OB-0b (`blurAsyncCheck` helper) | ⚠️ Partial | Helper extracted correctly (`lib/forms/blur-async-check.ts`), **no co-located test** was added despite the doc asking for one. |
| OB-1a (`profile.email` onBlurAsync) | 🐛 **Broken** | Wired, but see [BUG-1](#bug-1--profileemail-always-reports-already-registered). |
| OB-1b (`profile.username` trigger) | ⚠️ Partial | Trigger changed `onChangeAsync`→`onBlurAsync` correctly (500ms→150ms debounce). The "surface the Available state" half of the same fix (extend `FormFieldInfo` or render a success span, so `t.profile.usernameAvailable` finally gets used) was **not done**. |
| OB-1c (dependency on OB-0a) | ✅ Done | No separate code needed once OB-0a landed; confirmed. |
| OB-2 (`api-key.name` validators) | ✅ Done | Matches doc almost verbatim. |
| OB-3a (`billing.couponCode` reference) | ✅ Untouched | Correct — no change was proposed. |
| OB-3b (`billing.taxId` regex) | ✅ Done | Implemented as an inline field-level `onBlur` regex instead of inside the Zod schema — functionally equivalent to the doc's proposal. |
| OB-4a (`checkout.phone` regex) | ✅ Done | Both in `createCheckoutFieldSchemas`/`checkoutSchema` and the field's inline `onBlur` — slightly redundant (same regex twice) but harmless. |
| OB-4b (email/confirmEmail mismatch timing) | ✅ Done | `onChangeListenTo`→`onBlurListenTo`, form-level `onChange` guard removed in favor of the field's own `onBlur`, exactly as proposed. |
| OB-4c (`checkout.postalCode` onBlurAsync) | ❌ **Not done** | Still submit-time only (`checkout/PageContent.tsx:101-104`). Not mentioned in the commit message. Original fix plan in §7c is still valid — see [21.3](#213-ob-4c--wire-postal-code-onblurasync). |
| OB-4d (`AddressGroup` sync validators) | ✅ Done | `street`/`city`/`province`/`postalCode` all wired to `onBlur` schemas inside `AddressGroup`. |
| OB-5a (team-invite silent-failure bug) | ✅ Done | Inline `emailInputError` state added, `emailInvalid`/`emailDuplicate` copy now actually renders. Good fix, matches doc. |
| OB-5b ("already a member" check) | ❌ **Not done** | Still fixed to `field: "emails.2"` and checked only at submit (`team-invite/PageContent.tsx:61`). Not mentioned in the commit message. Original fix plan in §8b is still valid — see [21.4](#214-ob-5b--per-email-already-a-member-check). |
| OB-5c (`role` uses `onChange`) | ✅ Confirmed no-op | Correctly left alone, as the doc said to. |
| OB-6 (`content-editor.slug` onBlurAsync) | 🐛 **Broken** | Wired, gated on `slugEditedByUser.current`, but see [BUG-2](#bug-2--content-editorslug-always-toasts-already-in-use). |
| OB-7a (`handleSaveAll` catch-block fix) | ✅ Done | Now surfaces the real failure (`exceptionHandler` + destructive toast) instead of always showing the success toast. |
| OB-7b (per-row `quantity` onBlurAsync) | 🐛 **Broken** | Wired, but see [BUG-3](#bug-3--editable-table-quantity-always-reports-row-rejected). |
| OB-8 (Field States 4th demo card) | ✅ Done, and correct | The one new onBlurAsync example that's actually gated properly (`RESERVED_WORDS` client-side set) — use this file as the reference pattern when fixing BUG-1/2/3, not `handleCouponBlur` (coupon's "reject unless in the known-good list" semantics are inverted from what email/slug/quantity need). |
| OB-9 / OB-10 / OB-11 / OB-12 | ✅ N/A, confirmed | Correctly untouched. |
| §16 i18n table (6 keys) | ✅ Done | All 6 present, both locales. Locale parity verified programmatically: 344/344 keys match between `en` and `tr` after this commit (up from 310/310 pre-Rev-1). |
| §18 UX-0a (`required`→`<Input>`) | ❌ Not done | `features/forms/ui/TextField.tsx:9-24` still never forwards `required`/`aria-required` to the `<Input>`. |
| §18 UX-0b (`aria-label` on icon buttons) | ❌ Not done | Zero `aria-label` attributes anywhere under `views/forms/**` (grep-confirmed). |
| §18 UX-0c (confirm step on destructive actions) | ❌ Not done | No confirmation added to API-key revoke, table row delete, or draft discard. |
| §18 UX-0d (`hint` prop + display) | ❌ Not done | No `hint` prop exists on `TextField`. The i18n keys this fix needs (`usernameHint`, `taxIdHint`, `phoneHint`, `slugHint`, `couponHint`, `bioHint`, `quantityHint`, `unitPriceHint`, `postalCodeHint`) **were added to both message files but are never referenced in any component** — dead keys, 0 usages confirmed by grep. |
| §18 UX-0e (hardcoded-string swaps) | ❌ Not done | Every literal the doc listed is still hardcoded: `"IP Whitelist (optional)"`, `"Enter IP and press Enter"` (`api-key/PageContent.tsx:257,262`), `"Loading..."` (`:156`), `"Config copied to clipboard"`, `"Field names: "`, `"Untitled"`, `"Comma-separated"` (`form-builder/PageContent.tsx:143,199,239,308`), `title="Save row"` (`editable-table/PageContent.tsx:315`), etc. Corresponding i18n keys (`ipWhitelistLabel`... wait, that one pre-existed; `addIp`, `removeIp`, `configCopied`, `fieldNamesLabel`, `untitledField`, `optionsPlaceholder`, `net`, `savedBadge`, `saveRow`, `common.loading`) were added to the message JSON but never wired in — same dead-key pattern as UX-0d. `error-lab/PageContent.tsx` still never calls `useMessages("forms")`, despite `errorLab.*` keys being added. |
| §18 UX-0f (upload size/type hints) | ❌ Not done | Not spot-checked line-by-line in this pass, but given the pattern above (i18n added, nothing wired), treat as not done until verified. |
| §19–20 UX-1/UX-2 (per-field hint copy + i18n) | ⚠️ i18n only | Every string in the §20 table was added to both locale files. None of it is rendered anywhere — it's inert until UX-0d's `hint` prop exists and each field passes one. |

### 21.2 The 3 critical bugs — root cause and fix

**Shared root cause:** `useFormsDemoActions().simulateError(scenarioId, opts)`
defaults `failRate` to **1** (always fail) whenever the caller doesn't pass
one — confirmed in `validators/forms/simulate-error.ts:6`
(`failRate: z.number().min(0).max(1).default(1)`) and
`app/api/forms-demo/simulate-error/route.ts:41`
(`if (Math.random() > failRate) return <success>`, which is never true when
`failRate` is 1). The two existing call sites that behave correctly both
gate the call behind a client-side condition first, so `simulateError` is
only reached for values that are *supposed* to fail:
- `handleCouponBlur` (`billing/PageContent.tsx:81-83`): `if
  (VALID_COUPONS[upper]) return undefined;` before calling `simulateError`.
- OB-8's new `checkReservedWord` (`field-states/PageContent.tsx:19-27`):
  only returns an error if `RESERVED_WORDS.has(value.toLowerCase())`.

The three new OB-1a/OB-6/OB-7b call sites skip that gate, so they call
`simulateError` unconditionally on every blur — which, given the failRate-1
default, means **every blur always fails**, for every value, on every field.

#### BUG-1 — `profile.email` always reports "already registered"

**File:** `views/forms/profile/PageContent.tsx:161-176`. Current code:

```ts
onBlurAsync: async ({ value }) => {
  if (!value || !fieldSchemas.email.safeParse(value).success) return undefined;
  return blurAsyncCheck(value, "profile-email-taken", {
    simulateError, toast, allMessages,
  });
},
```

Any syntactically-valid email — including one nobody has ever registered —
shows `t.profile... "Email is already registered"` on every blur. This is
the exact field the whole doc was written to fix; right now it's worse than
before the fix (before: no check at all; now: a check that's always wrong).

**Fix — add a demo "already taken" allowlist, mirroring `VALID_COUPONS`:**

```ts
const TAKEN_EMAILS = new Set(["taken@example.com", "admin@example.com"]);

// inside the component:
onBlurAsync: async ({ value }) => {
  if (!value || !fieldSchemas.email.safeParse(value).success) return undefined;
  if (!TAKEN_EMAILS.has(value.toLowerCase())) return undefined;
  return blurAsyncCheck(value, "profile-email-taken", {
    simulateError, toast, allMessages,
  });
},
```

Place `TAKEN_EMAILS` at module scope near the top of the file (same spot
`VALID_COUPONS` lives in `billing/PageContent.tsx`). No scenario/i18n change
needed — `profile-email-taken` and `auth.errors.emailTaken` are already
correct.

#### BUG-2 — `content-editor.slug` always toasts "already in use"

**File:** `views/forms/content-editor/PageContent.tsx:315-322`. Two
compounding bugs:

1. **Same missing-gate bug as BUG-1** — no known-bad list, so
   `simulateError("content-slug-taken")` is called unconditionally and
   always fails.
2. **Wrong surface** — the `content-slug-taken` scenario
   (`lib/forms/error-scenarios.ts:140-147`) uses `exc:
   "EX_CONFLICT_DUPLICATE"`, which maps to `"toast"` in `EXC_TO_SURFACE`
   (`exception-handler.ts:33`), not `"form-field"`. `blurAsyncCheck` checks
   `getSurface(exc.exc) === "toast"` and, when true, shows a toast and
   returns `undefined` — so **even after fixing bug 1, this would never
   actually attach to the slug field**, it would just toast repeatedly.

**Fix, part A — gate the call:**

```ts
const TAKEN_SLUGS = new Set(["getting-started", "hello-world"]);

// inside the onBlurAsync:
onBlurAsync: async ({ value }) => {
  if (!value || !slugEditedByUser.current) return undefined;
  if (!TAKEN_SLUGS.has(value.toLowerCase())) return undefined;
  return blurAsyncCheck(value, "content-slug-taken", { simulateError, toast, allMessages });
},
```

**Fix, part B — change the scenario's `exc` to one that surfaces on the
field.** Reuse `EX_VALIDATION_FORM` (already `"form-field"`-mapped, and
already the pattern every other field-targeted scenario in this file uses —
`validation-form-field`, `coupon-invalid`, `postal-code-group`,
`row-rejected` all use it) rather than inventing a new exception code:

```diff
   {
     id: "content-slug-taken",
     status: 409,
-    exc: "EX_CONFLICT_DUPLICATE",
+    exc: "EX_VALIDATION_FORM",
     key: "forms.errors.slugTaken",
     msg: "This slug is already in use",
     field: "slug",
   },
```

(`lib/forms/error-scenarios.ts:140-147`.) No `EXC_TO_SURFACE` change needed
— `EX_VALIDATION_FORM` is already `"form-field"`.

#### BUG-3 — editable-table `quantity` always reports row rejected

**File:** `views/forms/editable-table/PageContent.tsx:184-203`. Current
code hand-rolls its own try/catch instead of reusing the OB-0b
`blurAsyncCheck` helper, ignores the field's `value` entirely, and calls
`simulateError("row-rejected")` unconditionally on every blur of every row:

```ts
onBlurAsyncDebounceMs: 300,
onBlurAsync: async () => {
  try {
    await simulateError("row-rejected");
    return undefined;
  } catch {
    return t.editableTable.saveFailed;
  }
},
```

Every row's quantity field shows an error the instant you blur off it,
regardless of the number typed — the demo table becomes unusable.

**Fix — gate on a real-looking condition (the doc's own suggestion, "e.g.
exceeds available stock") and reuse `blurAsyncCheck` for consistent
i18n/surface handling instead of the hand-rolled try/catch:**

```ts
onBlurAsyncDebounceMs: 300,
onBlurAsync: async ({ value }) => {
  if (!value || Number(value) <= 100) return undefined;
  return blurAsyncCheck(String(value), "row-rejected", {
    simulateError, toast, allMessages,
  });
},
```

(`100` is an arbitrary demo "in stock" ceiling — pick whatever reads well
next to the existing `min(1)` rule.) This needs `allMessages` in scope
(`useAllMessages()`) — not currently imported in this file, add it next to
the existing `useMessages("forms")` call. Using `blurAsyncCheck` also fixes
a secondary issue for free: it resolves the message via
`exceptionToFormErrors`/`allMessages` (proper i18n, `forms.errors.rowRejected`
→ "This row was rejected by the server") instead of the hardcoded
`t.editableTable.saveFailed` ("Some rows failed") the current code returns,
which is both non-localized-per-scenario and the wrong copy for a
per-field validator. The scenario's hardcoded `field: "rows.3.quantity"`
does **not** need to change — `exceptionToFormErrors` produces a
`{field: message}` map and `blurAsyncCheck` always takes
`Object.values(result.fields)[0]`, so the literal field-path string is
never actually matched against the row index; whichever row's validator
called it gets the message back regardless.

### 21.3 OB-4c — wire postal code `onBlurAsync`

Not touched by `60acca2`. §7c's original plan is unchanged and still
correct: add `onBlurAsync`/`onBlurAsyncDebounceMs: 300` to both
`shippingAddress.postalCode` and `billingAddress.postalCode` inside
`AddressGroup` (`checkout/PageContent.tsx:37-50`), calling `simulateError`
when `value === "00000"` (gate condition already exists as a literal
comparison — reuse it, don't add a new demo list). Keep the existing
submit-time check in `submitCheckout` too (defense in depth, not a
replacement).

### 21.4 OB-5b — per-email "already a member" check

Not touched by `60acca2`. §8b's original plan is unchanged and still
correct: move the check from `submitTeamInvite`'s unconditional
`simulateError("invite-email-member")` (currently hardcoded to
`field: "emails.2"`, `team-invite/PageContent.tsx:61`) to the moment an
email is added (the `onKeyDown`/`Add`-button handlers touched by OB-5a,
`PageContent.tsx:196-231`), gated on a small demo list (e.g.
`"taken@example.com"` always conflicts) rather than a fixed array index.

### 21.5 Suggested order for closing this out

1. **BUG-1, BUG-2, BUG-3** first — these are regressions a live demo user
   would hit immediately, worse than the pre-Rev-1 baseline of "no check at
   all."
2. **OB-4c, OB-5b** — the two remaining genuine onBlur-check items from the
   original scope, isolated, no shared dependency.
3. **OB-0b test, OB-1b Available-state** — small polish items, do whenever
   convenient.
4. **§18–20 (UX-0..UX-2)** — a distinct, larger audit (accessibility +
   proactive hint copy + i18n hygiene), not part of the "onBlur backend
   checks" scope this doc's title names. Treat as its own follow-up pass
   rather than folding into the same commit as 1–3 above; the i18n keys are
   already sitting in both locale files ready to be wired up whenever that
   pass happens.

---

## 22. Rev 3 — Re-verification of 056531b

**2026-07-20.** Berkay said "check again I have completed changes." Commit
`056531b4` ("project-enhance-4: Rev 2 fixes — gate onBlurAsync false
positives, OB-4c/OB-5b, UX audit") claims to close §21's entire fix guide
plus a meaningful slice of §18's UX-0 audit in one pass. Re-verified the
same way as Rev 2 — read every diffed file, re-traced the exact runtime
paths (gating conditions, `EXC_TO_SURFACE`, `simulateError` default
`failRate`) that exposed the original bugs, rather than trusting that a
matching variable/function name means the logic is right.

### 22.1 Status table

| Item | Status | Detail |
|---|---|---|
| BUG-1 (`profile.email`) | ✅ **Fixed** | `TAKEN_EMAILS` set (`taken@example.com`, `admin@example.com`) gates the call exactly as proposed — any other syntactically-valid email now correctly shows no error. |
| BUG-2 (`content-editor.slug`) | ✅ **Fixed** | Both halves done: `TAKEN_SLUGS` gate added, **and** `content-slug-taken`'s `exc` changed `EX_CONFLICT_DUPLICATE` → `EX_VALIDATION_FORM` (`error-scenarios.ts:143`) so it now actually surfaces on the field instead of toasting. |
| BUG-3 (editable-table `quantity`) | ✅ **Fixed** | Gated on `Number(value) <= 100`, hand-rolled try/catch replaced with `blurAsyncCheck` (`allMessages` newly imported) — matches §21.2's proposal exactly, including the "field-path doesn't need to match" reasoning. |
| OB-4c (postal code `onBlurAsync`) | ✅ Done | Wired inside `AddressGroup`, gated on `value !== "00000"`, uses `blurAsyncCheck`. Works for both shipping/billing groups since `AddressGroup` is shared and `blurAsyncCheck` doesn't key off the scenario's static `field` path. |
| OB-5b (per-email "already a member") | ✅ Done | `MEMBER_EMAILS` set (`alice@example.com`, `bob@example.com`) checked at add-time in both the Enter-key and Add-button handlers. The old fixed-index submit-time branch in `submitTeamInvite` was cleanly removed (not left dangling) — `simulateError`/`getSurface`/`exceptionToFormErrors` imports pruned to just what's still used. |
| OB-0b (co-located test) | ✅ Done | `blur-async-check.test.ts`, 5 cases (success / toast-surface / form-field-surface / non-exception rejection / no-fields exception). Ran live: **5/5 pass.** |
| OB-1b (Available state) | ✅ Done | `usernameAvailable` state + green `<span>` under the username field, reset on every keystroke via a `listeners.onChange`. Uses `text-green-600 text-xxs` — checked against the reference page the original doc pointed to (`views/settings/account/FreePageView.tsx:231`) and it's an exact match, not a deviation. |
| UX-0a (`required`/`aria-required`) | ⚠️ **Half done, currently inert** | `required={required}` now reaches `<Input>` — but `aria-required` was never added despite the commit message claiming both, **and no field in any of the 12 examples passes `required=` to `field.TextField`** (grep-confirmed 0 usages). The plumbing works; nothing exercises it yet, so this fix has zero visible effect on the app today. |
| UX-0b (`aria-label`) | ✅ Done | Added to all 4 `editable-table` icon buttons, the 2 chip-remove buttons (api-key IP, team-invite email — both parameterized with the specific value being removed, a nice touch beyond what the doc asked for), and the new `ConfirmDialog`-wrapped buttons. |
| UX-0c (confirm step) | ✅ Done, minor gap | Reuses the pre-existing `components/ui/ConfirmDialog` (correctly checked for one before building a new one, per the doc's own note) for API-key revoke, draft discard, and row delete. Gap: all three pass `description=""` — the dialog shows a title and Confirm/Cancel buttons but no explanatory "this cannot be undone" copy, so it's a real extra-click gate but a shallower version of what §18 asked for. |
| UX-0d (`hint` prop) | ✅ Done, scoped as claimed | `TextField`/`FormFieldInfo`/both type files updated correctly (`FormFieldInfo` now renders the hint only when there's no error/isValidating, so it doesn't fight with error text). Wired to exactly the 6 fields the commit message claims (`username`, `slug`, `couponCode`, `taxId`, `postalCode`, `phone`) — verified by grep, not overstated. `bio`/`quantity`/`unitPrice` hints from §19 remain unwired (never claimed as done). |
| UX-0e (hardcoded strings) | ✅ Done, scoped as claimed | The 4 named views (`api-key`, `editable-table`, `error-lab`, `form-builder`) had every literal §18 listed for them swapped to `t.*` calls; `error-lab` now calls `useMessages("forms")`. Interesting detail: `"Loading..."` and the API-key revoke-confirm copy were wired to **pre-existing, previously-unused keys** (`t.fieldStates.loading`, `t.apiKey.revokeConfirm`) rather than the `common.loading`/new key the original doc suggested — pragmatic, avoids adding more dead keys, though borrowing `fieldStates.loading` for an unrelated view is a minor cross-namespace smell, not a bug. |
| §18 items not in this commit (UX-0f, remaining §19/20 hint keys, team-invite's other hardcoded strings) | ❌ Still open | Not claimed as done this round; unchanged from Rev 2's assessment. |

### 22.2 Gates

`pnpm typecheck` — clean. `pnpm lint` — clean. `blur-async-check.test.ts` —
5/5 pass. i18n parity — 344/344 keys match between `en`/`tr` (messages.json
wasn't touched this commit; all new copy reused pre-existing keys from
`60acca2`'s additions).

### 22.3 What's left, if this gets picked up again

Neither item below is a regression or a broken promise — both are honest
gaps in an otherwise-accurate commit:

1. Add `aria-required={required}` next to the existing `required={required}`
   on `<Input>` in `TextField.tsx`, then actually pass `required` on the
   ~15 fields §18 named (`profile.firstName/lastName/username/email`,
   `checkout` address fields + `paymentMethod`, `billing.plan`,
   `teamInvite.role`, etc.) — otherwise the red asterisk/native browser
   affordance still never appears anywhere in the gallery.
2. Give the 3 `ConfirmDialog` usages real `description` copy (e.g. API-key
   revoke: reuse `t.apiKey.secretNote`-adjacent wording about the key being
   irrecoverable; row delete/draft discard: a short "this can't be undone"
   line) instead of `""`.

Everything else from §21's fix guide is closed. §§18–20's remaining scope
(UX-0f, the rest of §19/20's hint keys) is still open exactly as Rev 2 left
it.
