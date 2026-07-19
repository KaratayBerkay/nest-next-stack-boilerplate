# ui-upgrade-5 tracker

> Phase A — correctness & consistency debt. Items copied from
> `solutions-1.md` design doc.

## Phase A — debt closeout

### A1 — add `"use client"` to the 10 variant-hook consumers
- [x] skeleton/skeleton.tsx
- [x] breadcrumb/breadcrumb.tsx
- [x] kbd/kbd.tsx
- [x] textarea/textarea.tsx
- [x] pagination/pagination.tsx
- [x] card/card.tsx
- [x] button/icon-button.tsx
- [x] button/button.tsx
- [x] badge/badge.tsx
- [x] input/input.tsx
- [x] New canary test: `use-client-directive.test.ts` — 44 tests passing

**Gate**: ✅ canary test passes; shell one-liner returns empty.

### A2 — consolidate Typography into the folder; root becomes a shim
- [x] Replace `typography/typography.tsx` with full implementation from root
- [x] Extend `typography/index.ts` to export `Typography`
- [x] Reduce root `Typography.tsx` to a pure re-export shim
- [x] Update central barrel

**Gate**: ✅ root file is a pure re-export (0 `const variants`, folder
has 1); the literal "≤ 3 lines" reading is unachievable — prettier wraps
the 11-name export to 13 lines, same as the Card/Select shims — so the
gate is met in spirit, matching house shim style *(control run note)*.

### A3 — one types file per component; delete the 14+ duplicates
- [x] Reconciled and consolidated each family
- [x] Repointed 3 imports (avatar-group, dropdown-menu-item, command-item)
- [x] Deleted 17 standalone types files (83 → 66)

**Gate**: ✅ typecheck green; grep for deleted file names → 0.

### A4 — complete the central barrel
- [x] Added FileUpload, ImageUpload, LogoSpinner, CheckboxCard, CheckboxChip

**Gate**: ✅ all five present in barrel; typecheck green.

### A5a — Combobox repairs (mechanical)
- [x] type="button" on trigger
- [x] ARIA attributes (role="combobox", aria-expanded, aria-haspopup, aria-controls)
- [x] disabled prop with styling
- [x] Escape closes with focus return
- [x] Outside-click dismiss via useClickOutside
- [x] searchPlaceholder/emptyTitle/emptyDescription props (A10 rider)

**Gate**: ✅ combobox.test.tsx — 7 tests passing.

### A6 — Select disabled options + non-string labels
- [x] data-disabled + aria-disabled on disabled items
- [x] Skip disabled options in keyboard nav (ENABLED_OPTION_SELECTOR)
- [x] textContent fallback for non-string labels
- [x] Clear typeahead timeout on unmount
- [x] `select/select.test.tsx` — disabled item attrs, ArrowDown skips
  disabled, disabled click no-ops, JSX-children label in trigger
  *(control run: gate had been downgraded to "typecheck green"; the
  designed test gate is now met)*

**Gate**: ✅ select.test.tsx — 4 tests passing (was: typecheck only).

### A8 — replace every variant?: string with typed union
- [x] Created GlobalVariant type in global-style-variants.ts
- [x] Updated Counter-types, Checkbox-types, Tooltip-types
- [x] Updated 19 component files (collapsible, carousel, menubar, pagination, popover, drawer, context-menu, navigation-menu, hover-card, breadcrumb, dropdown-menu, toggle-group, alert-dialog, scroll-area, sheet, accordion ×3, resizable)
- [x] Fixed toggle-group demo page type error

**Gate**: ✅ `grep -rn "variant?: string" src/components/ui src/types/ui` → 0; typecheck green.

### A10 — every built-in string becomes overridable
- [x] PaginationPrevious/PaginationNext: children override via `{children ?? <default>}`
- [x] Combobox: searchPlaceholder, emptyTitle, emptyDescription props
- [x] DialogContent `closeLabel` prop (default `"Close"`) — the ✕ label
  was not overridable at all *(control run)*
- [x] `pagination/pagination.test.tsx` — custom children render, default
  copy suppressed, aria-label overrides on Prev/Next and nav root
  *(control run)*
- [x] combobox.test.tsx — custom searchPlaceholder + empty-state copy
  *(control run)*
- [x] dialog-content.test.tsx — closeLabel default + override
  *(control run)*
- [x] Turkish-labeled demo example on the pagination page ("Localized"
  tab) and the combobox page ("Localized" tab) *(control run)*
- [x] aria-label spread-order audit: command-list and pagination write
  the hardcoded label before `{...props}`, so consumer labels win

**Gate**: ✅ the four unit tests named in solutions-1 §A10 pass; demo
pages carry the localized examples (was: typecheck only).

### A11 — one status vocabulary: info | success | warning | error
- [x] Alert: added info recipe, destructive kept as alias
- [x] Toast: extended variant union with warning/info, added recipes
- [x] Badge: split axes — variant keeps status, pill/dot become boolean props
- [x] BadgeButton: added error alias
- [x] Migrated 5 demo page usages
- [x] **Alert-types union fixed** — the map had both `error` and
  `destructive` keys but the type union only exposed `destructive`, so
  the canonical name didn't typecheck; union is now
  `default | info | success | warning | error | destructive(alias)`
  *(control run — this inverted the design's "both type-visible" rule)*
- [x] Alert demo: Info example added; `destructive` usages flipped to
  canonical `error` (page + ConnectionUnstable.tsx); gallery list is the
  full `default|info|success|warning|error` row *(control run)*
- [x] Toast demo: Show Info / Show Warning triggers added; gallery now
  fires real toasts across all five variants (was: 3 static buttons)
  *(control run)*
- [x] Badge demo: duplicate Error chip removed, status row ordered to
  match the union, BadgeButton demo uses `error`, VariantGallery tab
  added (page had none) *(control run)*

**Gate**: ✅ `grep 'Badge[^>]*variant="(destructive|pill|dot)"' src/` → 0
(including BadgeButton, now canonical); `<Alert variant="destructive">`
in src/ → 0; contrast `--strict` exit 0 on all four themes; alert /
badge / toast pages show the full status row in demos **and** galleries.

---

## Control run — 2026-07-16 (verify b349c61 claims against solutions-1 gates)

Every Phase A gate from `solutions-1.md` was re-run against the code.

**Verified as claimed**: A1 (canary 44 files green, ui-analyze one-liner
empty), A2 (spirit — see note), A3 (66 types files, stale-import greps
0 incl. `DropdownMenuItem-types`), A4 (all five names in the barrel),
A5a (combobox.test.tsx covers all six named assertions), A8
(`variant?: string` grep → 0), A6/A10/A11 code changes present.

**Discrepancies found and fixed in this run**:
1. A6/A10 test gates had been silently downgraded to "typecheck green" —
   the designed tests didn't exist. Added `select.test.tsx` (4),
   `pagination.test.tsx` (4), combobox empty-copy test (1),
   dialog closeLabel tests (2).
2. A10: the Dialog ✕ label was not overridable → `closeLabel` prop on
   `DialogContent` (default `"Close"`); Turkish "Localized" demo tabs
   added to the pagination and combobox pages.
3. A11: `Alert-types.ts` union lacked the canonical `error` name
   (runtime map had it; type didn't) → union fixed, demo/app usages
   flipped to `error`, alert Info example, toast warning/info triggers +
   live 5-variant gallery, badge gallery added + duplicate chip removed.

**Standing gates after fixes**: lint 0 errors (70 pre-existing
warnings, all in `views/v1` shell code, untouched); typecheck clean;
**220 unit tests / 31 files** passing (was 209 claimed across 29);
contrast `--strict` exit 0 on all four themes.

**E2E status (could not verify the working tree locally)**: two
attempts. (1) With the stale `playwright/.auth/user.json` from Jul 14
the suite exits 0 but every UI test takes the auth-redirect skip path —
delete that file when you see mass skips. (2) With fresh auth, setup
fails: the Playwright-spawned bare `next dev` lacks the backend env that
docker compose injects, so its BFF auth routes return 500 (`Register
failed (500): {}`) while the same login against the dockerized app on
:3100 returns 200 — the backend is healthy, and the dockerized app can't
gate this commit anyway (stale image). The `ui-smoke`/`ui-a11y` walk for
this commit therefore rides on CI, which starts a backend and runs
`pnpm test:e2e` (frontend-ci.yml).

**All Phase A items complete and control-verified.** Ready for Phase B
(engines + behavior; C1 anchored-layer first).
