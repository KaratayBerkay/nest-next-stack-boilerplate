# Enhancements 2 — Settings pages (General / Account / Privacy / Billing)

> Planning tracker, written 2026-07-06. Status: **planning only — no code written yet**,
> following this project's established convention (see `enhancements1.md` and the
> archived `docs/progress/archive/phaseN.md` trackers): draft the design + task list
> first, implement only once Berkay kicks it off explicitly.
>
> Scope, from Berkay's request: build a real Settings section — General, Account,
> Privacy, Billing (reference: a left-aligned settings sub-nav with gear/user/shield/
> card icons) — including profile picture upload and username change, and wire it into
> both the header's profile dropdown and the left sidebar nav. Framed explicitly as part
> of turning this boilerplate into a commercial-site shape: users can upgrade their plan,
> pay, and manage their own account settings self-serve.

## Survey (2026-07-06) — what already exists

This is **not greenfield everywhere** — some real infrastructure already exists, some
doesn't:

- **`/settings/sessions` already exists** (Phase 17 + enhancements1 #4): a real,
  working session-management page (list sessions, revoke one, revoke all others),
  following the `page.tsx` + `{Tier}PageView.tsx` split convention. It currently hangs
  directly off `/settings` with no parent settings shell — `V1Nav.tsx`'s only settings
  entry today is a single "Sessions" link (`IconSettings`, `/settings/sessions`).
- **`User` (`schema.prisma:237-`) already has every field a General/Account tab needs**:
  `name`, `username` (`@unique`), `avatarUrl`, `bio`, `birthDate`, `locale`, `timezone`.
  No schema migration needed for General/Account.
- **No self-serve profile-update mutation exists at all.** `UsersResolver`
  (`users/users.resolver.ts`) is a 2-method leftover (`users` query, `createUser`
  mutation with no auth guard) — clearly not the real profile surface. There is no
  `updateProfile`/`myProfile`-style mutation anywhere in the codebase (grepped).
- **Avatar upload infrastructure already exists and is genuinely reusable**, just not
  wired to "set my avatar" yet: `upload/minio.service.ts` (real S3-compatible client,
  bucket auto-created with public-read policy) + `upload/image.service.ts`
  (`IMAGE_SIZES` — produces resized `badge`/`medium`/`full` variants) +
  `upload/upload.controller.ts`'s `POST /upload/single` (multer, file-type/size
  validation via `ParseFilePipe`). The frontend's `/api/upload` BFF route already proxies
  to it. This is solid, production-shaped image-processing work — the plan below reuses
  it rather than rebuilding it.
- **No `settings` i18n namespace, no `SETTINGS_PATH` route constant.**
- **No privacy-related schema at all** — no `Block` model, no profile-visibility flag.
  A real "block users" / "who can see my profile" system would be new schema, not just
  new UI. Scoped down for v1 below (see D5) — flag if Berkay wants the fuller version.
- **Billing already has real substance to surface**: `myBillingHistory` query,
  `subscribeToPlan` mutation, `/pricing`, `/checkout/[tier]` (Phase 17). A Billing
  settings tab is mostly a new arrangement of existing data, not new backend work.
- **Header (`V1Shell.tsx`) `ProfileDropdown`** (top-right avatar) and **sidebar
  `ProfileSection`** (bottom-left avatar, expanded sidebar) both currently show only
  name/email/tier + a "Sign out" button — no "Settings" entry point in either.

## Decisions

- **D1 — Settings is a shell with its own internal sub-nav**, matching the reference
  image: `/settings` renders a persistent left-aligned icon+label list (General,
  Account, Privacy, Billing — plus **Sessions**, folded in as a 5th item since it
  already exists and belongs here) inside the content area, with each tab as its own
  route (`/settings/general`, `/settings/account`, `/settings/privacy`,
  `/settings/billing`, `/settings/sessions`) so each keeps its own `page.tsx` +
  `{Tier}PageView.tsx` split per this project's established convention. `/settings`
  itself redirects to `/settings/general`.
- **D2 — Avatar upload reuses the existing upload pipeline, doesn't rebuild it.** Flow:
  frontend uploads via the existing `/api/upload` BFF route (already proxies to
  `POST /upload/single`) → gets back `{urls: {badge, medium, full}}` → calls a new
  `updateProfile(avatarUrl: urls.full)` mutation to persist it. No new image-processing
  code; the only new backend work is the mutation that saves the URL to `User.avatarUrl`.
- **D3 — One `updateProfile` mutation covers the whole General+Account tab**, not one
  mutation per field: `updateProfile(input: {name?, username?, bio?, avatarUrl?,
  locale?, timezone?})`, self-serve (own account only, via `@CurrentUser()`), partial
  update (only provided fields change). Username changes re-check the existing
  `@unique` constraint and reuse `UsernameService`'s validation shape
  (3-30 chars) rather than inventing new rules. A separate `isUsernameAvailable(username)`
  query is needed for live-validate-as-you-type UX (debounced, matching the existing
  `find-friends` search debounce pattern already in the codebase).
- **D4 — Email and password changes are explicitly out of scope for this round.**
  Changing email touches verification-token flows and re-auth; changing password
  already exists as a *forgotten*-password flow but not a *change-while-logged-in* one.
  Both are real, separate features — flagging so "Account" doesn't quietly grow to
  include them without a decision. If Berkay wants either now, say so and it gets its
  own stage below.
- **D5 — Privacy tab is intentionally minimal in this round.** No `Block` model or
  profile-visibility flag exists today, and building either is a schema change, not
  just UI. v1 ships: a read-only "Sessions & Devices" cross-link (since session control
  *is* a privacy concern and already exists), plus a `myProfile` export data note. It
  does **not** ship blocking or profile-visibility — those need their own scoped-out
  decision from Berkay (new schema + moderation-shaped questions: can a blocked user
  still see your posts? does blocking need to be mutual to hide messages? etc.) rather
  than being quietly bundled in. **Confirm with Berkay whether Privacy should be
  deferred to `enhancements3.md` or given a real (larger) scope now.**
- **D6 — Billing tab is a re-surfacing of Phase 17's work, not new backend.** Shows
  current tier + price, `myBillingHistory` as a transaction list, and an "Upgrade" CTA
  linking to `/pricing`. No new mutations.
- **D7 — New mutations must not repeat the enhancements1-verification bug.** Every new
  mutation here (`updateProfile`, anything Billing/Privacy add) sits behind
  `SessionAuthGuard`, which — per the enhancements1 fix — now enforces CSRF on every
  mutation automatically. Any new BFF route calling one of these mutations **must** call
  `csrfEchoHeaders()` (see `app/api/auth/logout/route.ts` for the reference pattern) —
  this exact omission is what broke the brand-new sessions-revoke feature last round.
  Calling this out explicitly so it isn't repeated.
- **D8 — Navigation**: header `ProfileDropdown` gets a "Settings" link (→
  `/settings/general`) inserted above "Sign out"; sidebar `ProfileSection`'s expanded
  panel gets the same. `V1Nav.tsx`'s existing single "Sessions" entry is replaced by one
  "Settings" entry (→ `/settings/general`) — the tab-level nav (General/Account/Privacy/
  Billing/Sessions) lives inside the settings shell itself (D1), not duplicated in the
  main app sidebar.

## Tasks

Sizes: S ≈ ≤2h, M ≈ ≤half day, L ≈ ≥1 day. Stage A is backend-first since B/C need the
mutation to exist. Stage D (nav wiring) can land alongside C once at least one tab is
real, so the settings shell isn't linked from the header while empty. Each task below
has a concrete "How" with real file paths and code sketches, in this project's own
patterns (checked against the actual codebase, not generic boilerplate).

### Stage A — Backend: profile mutation + i18n scaffolding

- [ ] **T1 (M) — `updateProfile` mutation + `myProfile`/`isUsernameAvailable` queries**
  on a new `ProfileResolver` (`src/profile/`, sibling to `billing/`/`friends/` — not the
  leftover `UsersResolver`).

  **How:**
  1. `nest-js-boilerplate/src/profile/dto/update-profile.input.ts`:
     ```ts
     import { Field, InputType } from '@nestjs/graphql';
     import { IsIn, IsOptional, IsUrl, Matches, MaxLength, MinLength } from 'class-validator';

     @InputType()
     export class UpdateProfileInput {
       @Field({ nullable: true })
       @IsOptional() @MinLength(1) @MaxLength(80)
       name?: string;

       @Field({ nullable: true })
       @IsOptional() @MinLength(3) @MaxLength(30)
       @Matches(/^[a-z0-9_]+$/, {
         message: 'Username can only contain lowercase letters, numbers, and underscores',
       })
       username?: string;

       @Field({ nullable: true })
       @IsOptional() @MaxLength(280)
       bio?: string;

       @Field({ nullable: true })
       @IsOptional() @IsUrl()
       avatarUrl?: string;

       @Field({ nullable: true })
       @IsOptional() @IsIn(['en', 'tr'])
       locale?: string;

       @Field({ nullable: true })
       @IsOptional()
       timezone?: string;
     }
     ```
     (Client sends lowercase already via `formatUsername`/`.toLowerCase()` in the form,
     but the server never trusts that — see step 2.)
  2. `nest-js-boilerplate/src/profile/profile.service.ts`:
     ```ts
     @Injectable()
     export class ProfileService {
       constructor(
         private readonly prisma: PrismaService,
         private readonly tokenStore: TokenStoreService,
       ) {}

       async isUsernameAvailable(username: string, currentUserId: string): Promise<boolean> {
         const normalized = username.toLowerCase();
         if (normalized.length < 3 || normalized.length > 30) return false;
         if (!/^[a-z0-9_]+$/.test(normalized)) return false;
         const existing = await this.prisma.user.findUnique({ where: { username: normalized } });
         return !existing || existing.id === currentUserId;
       }

       async updateProfile(userId: string, input: UpdateProfileInput) {
         const data: Prisma.UserUpdateInput = {};
         if (input.name !== undefined) data.name = input.name;
         if (input.bio !== undefined) data.bio = input.bio;
         if (input.avatarUrl !== undefined) data.avatarUrl = input.avatarUrl;
         if (input.locale !== undefined) data.locale = input.locale;
         if (input.timezone !== undefined) data.timezone = input.timezone;

         if (input.username !== undefined) {
           const username = input.username.toLowerCase();
           const existing = await this.prisma.user.findUnique({ where: { username } });
           if (existing && existing.id !== userId) {
             throw new ConflictException({
               exc: 'EX_PROFILE_USERNAME_TAKEN',
               msg: 'Username is already taken',
               key: 'settings.errors.usernameTaken',
               field: 'username',
             });
           }
           data.username = username;
         }

         const user = await this.prisma.user.update({ where: { id: userId }, data });

         // Keep the Redis session snapshot in sync — same pattern setUserTier already
         // uses for `tier` (token-store.service.ts's rewriteFieldsForUser), so `me` and
         // the WS handshake reflect the change without forcing a re-login.
         const redisFields: Record<string, string> = {};
         if (input.name !== undefined) redisFields.name = input.name;
         if (input.username !== undefined) redisFields.username = user.username ?? '';
         if (input.avatarUrl !== undefined) redisFields.avatarUrl = input.avatarUrl;
         if (Object.keys(redisFields).length > 0) {
           await this.tokenStore.rewriteFieldsForUser(userId, redisFields);
         }

         return user;
       }
     }
     ```
  3. `nest-js-boilerplate/src/profile/profile.resolver.ts`:
     ```ts
     @UseGuards(SessionAuthGuard)
     @Resolver()
     export class ProfileResolver {
       constructor(
         private readonly profile: ProfileService,
         private readonly prisma: PrismaService,
       ) {}

       // Full Postgres row (bio/birthDate/etc — `me`'s Redis snapshot doesn't carry these)
       // for the settings form to load on mount.
       @Query(() => User, { name: 'myProfile' })
       async myProfile(@CurrentUser() user: JwtUser) {
         return this.prisma.user.findUniqueOrThrow({ where: { id: user.userId } });
       }

       @Query(() => Boolean)
       async isUsernameAvailable(
         @Args('username') username: string,
         @CurrentUser() user: JwtUser,
       ): Promise<boolean> {
         return this.profile.isUsernameAvailable(username, user.userId);
       }

       @Mutation(() => User)
       async updateProfile(
         @Args('input') input: UpdateProfileInput,
         @CurrentUser() user: JwtUser,
       ) {
         return this.profile.updateProfile(user.userId, input);
       }
     }
     ```
     No `@UseGuards(CsrfGuard)` needed on top — `SessionAuthGuard` now enforces CSRF on
     every mutation automatically (the enhancements1 0a fix), and `isGraphQLMutation`
     correctly leaves `myProfile`/`isUsernameAvailable` (queries) untouched.
  4. `nest-js-boilerplate/src/profile/profile.module.ts` — standard module wiring
     `ProfileResolver`/`ProfileService`, importing nothing beyond `PrismaModule`
     (global) and `AuthModule` (for `TokenStoreService` — check whether it's already
     exported from `AuthModule`, it is per `auth.module.ts`'s `exports` array). Add
     `ProfileModule` to `app.module.ts`'s `imports`, same spot `SessionsModule` was
     added in the enhancements1 pass.
  *Verify:* unit tests for `ProfileService` — partial update only touches provided
  fields; username conflict throws the structured exception (not a raw `P2002`);
  `isUsernameAvailable` returns `true` for the caller's own current username (so
  resubmitting the form without changing username never falsely says "taken"). Live
  check: change name via the mutation directly (or once T4 lands), confirm `me` reflects
  it without re-login.

- [ ] **T2 (S) — `settings` i18n namespace.**
  `next-js-boilerplate/messages/en/settings/messages.json` (and `tr` equivalent):
  ```json
  {
    "navGeneral": "General",
    "navAccount": "Account",
    "navPrivacy": "Privacy",
    "navBilling": "Billing",
    "navSessions": "Sessions",
    "accountHeading": "Account",
    "name": "Name",
    "username": "Username",
    "usernameChecking": "Checking availability…",
    "usernameAvailable": "Available",
    "usernameTaken": "Already taken",
    "bio": "Bio",
    "avatarChange": "Change photo",
    "save": "Save changes",
    "saveSuccess": "Profile updated",
    "generalHeading": "General",
    "language": "Language",
    "timezone": "Timezone",
    "theme": "Theme",
    "billingHeading": "Billing",
    "currentPlan": "Current plan",
    "upgradePlan": "Upgrade plan",
    "billingHistory": "Billing history",
    "billingHistoryEmpty": "No transactions yet.",
    "privacyHeading": "Privacy",
    "privacySessionsNote": "Manage where you're signed in from the Sessions tab.",
    "settingsLink": "Settings"
  }
  ```
  Run `pnpm generate-i18n-types` after (per every prior namespace addition in this
  project — regenerates `src/generated/i18n-messages.d.ts`).

### Stage B — Frontend: settings shell + General/Account tabs

- [ ] **T3 (M) — `/settings` shell.**

  **How:**
  1. `next-js-boilerplate/src/app/v1/[lang]/settings/page.tsx` — redirect only:
     ```tsx
     import { redirect } from "next/navigation";

     export default async function SettingsIndexPage({
       params,
     }: {
       params: Promise<{ lang: string }>;
     }) {
       const { lang } = await params;
       redirect(`/v1/${lang}/settings/general`);
     }
     ```
  2. `next-js-boilerplate/src/components/settings/SettingsNav.tsx` — the vertical
     icon+label list from the reference image, active-state highlighted by pathname
     (same highlighting pattern `V1Nav.tsx` already uses):
     ```tsx
     "use client";
     import Link from "next/link";
     import { useParams, usePathname } from "next/navigation";
     import { useMessages } from "@/lib/i18n/MessagesProvider";
     import {
       IconAdjustments, IconUser, IconShieldLock, IconCreditCard, IconDevices,
     } from "@tabler/icons-react";

     const TABS = [
       { href: "general", labelKey: "navGeneral", Icon: IconAdjustments },
       { href: "account", labelKey: "navAccount", Icon: IconUser },
       { href: "privacy", labelKey: "navPrivacy", Icon: IconShieldLock },
       { href: "billing", labelKey: "navBilling", Icon: IconCreditCard },
       { href: "sessions", labelKey: "navSessions", Icon: IconDevices },
     ] as const;

     export function SettingsNav() {
       const params = useParams<{ lang: string }>();
       const pathname = usePathname();
       const t = useMessages("settings");
       const base = `/v1/${params?.lang ?? ""}/settings`;

       return (
         <nav className="flex w-48 shrink-0 flex-col gap-0.5" aria-label="Settings">
           <p className="text-muted px-3 pb-2 text-xs font-semibold tracking-wider uppercase">
             {t.navGeneral && "Settings"}
           </p>
           {TABS.map(({ href, labelKey, Icon }) => {
             const full = `${base}/${href}`;
             const active = pathname === full;
             return (
               <Link
                 key={href}
                 href={full}
                 className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                   active ? "bg-brand/10 text-brand font-medium" : "text-muted hover:bg-surface-hover"
                 }`}
               >
                 <Icon size={18} stroke={1.5} />
                 <span>{t[labelKey as keyof typeof t] as string}</span>
               </Link>
             );
           })}
         </nav>
       );
     }
     ```
  3. `next-js-boilerplate/src/app/v1/[lang]/settings/layout.tsx` — Next.js layout
     wrapping every `settings/*` page in the sidebar-plus-content shape, so it's written
     once rather than duplicated per tab:
     ```tsx
     import { SettingsNav } from "@/components/settings/SettingsNav";

     export default function SettingsLayout({ children }: { children: React.ReactNode }) {
       return (
         <div className="flex min-h-0 flex-1 gap-6">
           <SettingsNav />
           <div className="min-w-0 flex-1">{children}</div>
         </div>
       );
     }
     ```
     This is the one place in the plan that's a plain `layout.tsx`, not a
     `{Tier}PageView` split — the split belongs to each *tab's own* `page.tsx`
     underneath it (D1), not to the shell wrapping all of them.

- [ ] **T4 (M) — Account tab** (`app/v1/[lang]/settings/account/`). No tier
  differentiation (D6-style reasoning: everyone gets the same profile form regardless
  of subscription) — so `page.tsx` renders `FreePageView` directly and
  `Basic/Medium/PremiumPageView` re-export it, matching `messages`/`notification`'s
  existing shape exactly.

  **How (`views/FreePageView.tsx`):**
  1. Load current data via a `myProfile` query on mount (a small `apiFetchJson` to a
     new thin BFF route, `app/api/profile/route.ts` `GET`, that forwards to the
     backend GraphQL — following the `sessionTokenHeaders()`/`graphqlFetch` pattern
     every other authenticated BFF route already uses).
  2. Debounced username-availability check, mirroring `find-friends`'s existing
     `setTimeout`-ref debounce shape (`find-friends/views/FreePageView.tsx:130,168`):
     ```tsx
     const [username, setUsername] = useState(profile.username ?? "");
     const [availability, setAvailability] = useState<"idle" | "checking" | "available" | "taken">("idle");
     const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

     useEffect(() => {
       if (!username || username === profile.username) { setAvailability("idle"); return; }
       if (username.length < 3) { setAvailability("idle"); return; }
       setAvailability("checking");
       if (debounceRef.current) clearTimeout(debounceRef.current);
       debounceRef.current = setTimeout(async () => {
         const res = await apiFetchJson<{ available: boolean }>(
           `/api/profile/username-available?u=${encodeURIComponent(username)}`,
         );
         setAvailability(res.available ? "available" : "taken");
       }, 300);
       return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
     }, [username, profile.username]);
     ```
  3. Avatar upload — reuses the existing `/api/upload` route, then persists via the
     profile-update route:
     ```tsx
     const handleAvatarFile = async (file: File) => {
       const form = new FormData();
       form.append("file", file);
       const uploadRes = await apiFetchJson<{ urls: { full: string } }>("/api/upload", {
         method: "POST", body: form,
       });
       await saveProfile({ avatarUrl: uploadRes.urls.full });
     };
     ```
  4. Save handler posts only the changed fields to the new
     `app/api/profile/update/route.ts` (POST), which — per D7 — **must** call
     `csrfEchoHeaders()` before `graphqlFetch`, exactly like
     `app/api/billing/subscribe/route.ts` already does:
     ```ts
     // app/api/profile/update/route.ts
     import { NextResponse } from "next/server";
     import { cookies } from "next/headers";
     import { ACCESS_TOKEN_COOKIE } from "@/lib/cookie";
     import { csrfEchoHeaders, graphqlErrorBody, graphqlFetch } from "@/lib/backend";

     const UPDATE_PROFILE = `
       mutation UpdateProfile($input: UpdateProfileInput!) {
         updateProfile(input: $input) { id name username bio avatarUrl locale timezone }
       }
     `;

     export async function POST(req: Request) {
       const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
       if (!accessToken) return NextResponse.json({ statusCode: 401 }, { status: 401 });

       const extraHeaders = await csrfEchoHeaders();
       if (!extraHeaders) return NextResponse.json({ statusCode: 403 }, { status: 403 });

       const input = await req.json();
       const { data, errors } = await graphqlFetch(UPDATE_PROFILE, { input }, accessToken, extraHeaders);
       if (errors) {
         const body = graphqlErrorBody(errors, "Failed to update profile");
         return NextResponse.json(body, { status: body.statusCode });
       }
       return NextResponse.json(data);
     }
     ```
  5. On success, update `useAuth`'s local `user` state (name/avatarUrl) immediately —
     don't wait for a page reload — so the header/sidebar avatar and name update live;
     show a success `useToast()` (`components/ui/Toast.tsx`, already used elsewhere,
     e.g. `posts/[uuid]/views/MediumPageView.tsx`).
  *Verify:* change name → header + sidebar update without reload; type a taken
  username → inline "Already taken" within ~300ms, Save disabled while taken; upload an
  avatar → new image visible immediately and after a hard refresh (proves it persisted
  to MinIO + `User.avatarUrl`, not just local state).

- [ ] **T5 (S) — General tab** (`app/v1/[lang]/settings/general/`, same re-export
  shape as T4). Locale + timezone selects (`components/ui/Select.tsx` — note the
  enhancements1 fix for its focus-on-open bug should be in place before building a new
  form on top of it) bound to the same `updateProfile` mutation as T4 (`locale`/
  `timezone` fields). Theme: reuse `components/layout/ThemeToggle.tsx` as-is, just
  rendered here too, so users can find it from Settings as well as the header.

### Stage C — Billing + Privacy tabs

- [ ] **T6 (S) — Billing tab** (`app/v1/[lang]/settings/billing/`, re-export shape).
  Fetch `myBillingHistory` via a small `app/api/billing/history` **query** already
  built in Phase 17 (`api/billing/history/route.ts` — confirm it still exists and
  reuse it rather than adding a second route for the same data) and render as a list
  (date, tier, status, amount) using `components/ui/` primitives; tier/price block
  reads from `useAuth().user.tier` (already available) plus the same `TIER_PRICES`
  shape `checkout/[tier]/checkout-content.tsx` already defines — pull that into a
  shared `lib/tier.ts` constant instead of duplicating the price table a third time.
  "Upgrade" button links to `PRICING_PATH`.

- [ ] **T7 (S) — Privacy tab** (`app/v1/[lang]/settings/privacy/`, re-export shape),
  scoped per D5: a short explanatory paragraph + a `Link` to the Sessions tab
  ("Manage where you're signed in from the Sessions tab"). **Do not start this task
  until D5 is resolved** — if Berkay wants real blocking/visibility controls instead,
  this task's scope (and size estimate) changes completely and needs its own schema
  design pass first.

### Stage D — Navigation wiring

- [ ] **T8 (S) — Header `ProfileDropdown`** (`V1Shell.tsx`). Add a "Settings" link
  (`IconSettings` or `IconAdjustments`, `t.settingsLink` from the new namespace) between
  the name/email/tier block and the "Sign out" button, in both the desktop dropdown
  `content` JSX and the mobile full-screen portal variant (same `content` variable is
  reused for both per the existing component — one edit covers both):
  ```tsx
  <Link
    href={`/v1/${params?.lang ?? ""}/settings/general`}
    onClick={() => setOpen(false)}
    className="hover:bg-surface-hover flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm"
  >
    <IconSettings size={16} stroke={1.5} />
    {t.settingsLink}
  </Link>
  ```
  (`ProfileDropdown` doesn't currently receive `lang` as a prop — thread it through
  from `V1Shell`'s existing `lang` variable, same as `MessageDropdown` already does.)

- [ ] **T9 (S) — Sidebar `ProfileSection`** (`V1Shell.tsx`). Same link added to the
  expanded bottom-of-sidebar panel (the `{open && (...)}` block), above the existing
  "Sign out" button.

- [ ] **T10 (S) — `V1Nav.tsx`.** Replace the existing single settings entry:
  ```diff
  - {
  -   href: "/settings/sessions",
  -   label: "Sessions",
  -   Icon: IconSettings,
  -   auth: true,
  - },
  + {
  +   href: "/settings/general",
  +   label: t.navSettings, // add to the v1-shell namespace, or reuse settings.navGeneral's "Settings" heading via a new short key
  +   Icon: IconSettings,
  +   auth: true,
  + },
  ```
  Also remove `/settings/sessions` from `AUTH_REQUIRED_HREFS` and add `/settings/general`
  in its place (line 30) — the auth-required check keys off the exact href in the nav
  list.

## Verify loop (phase gate)

- [ ] Every new mutation is reachable only for the caller's own account — no `userId`
  argument a client could forge to edit someone else's profile.
- [ ] Every new BFF route that calls a mutation echoes a CSRF token (D7) — grep for
  `csrfEchoHeaders` in each new route file before considering this phase done, exactly
  the check that was missing last round.
- [ ] Changing name/username/avatar is reflected live in the header and sidebar without
  a re-login (proves the Redis-snapshot rewrite in T1 actually works, not just the DB
  write).
- [ ] `pnpm test`/`pnpm lint`/`tsc --noEmit` green in both packages.
- [ ] Live click-through of all 5 settings tabs in both `en`/`tr`.
