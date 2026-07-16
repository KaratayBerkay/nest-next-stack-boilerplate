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
- [x] Reduce root `Typography.tsx` to one-line shim
- [x] Update central barrel

**Gate**: ✅ root file is shim only; typecheck green.

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

**Gate**: ✅ typecheck green.

### A8 — replace every variant?: string with typed union
- [x] Created GlobalVariant type in global-style-variants.ts
- [x] Updated Counter-types, Checkbox-types, Tooltip-types
- [x] Updated 19 component files (collapsible, carousel, menubar, pagination, popover, drawer, context-menu, navigation-menu, hover-card, breadcrumb, dropdown-menu, toggle-group, alert-dialog, scroll-area, sheet, accordion ×3, resizable)
- [x] Fixed toggle-group demo page type error

**Gate**: ✅ `grep -rn "variant?: string" src/components/ui src/types/ui` → 0; typecheck green.

### A10 — every built-in string becomes overridable
- [x] PaginationPrevious/PaginationNext: children override via `{children ?? <default>}`
- [x] Combobox: searchPlaceholder, emptyTitle, emptyDescription props

**Gate**: ✅ typecheck green.

### A11 — one status vocabulary: info | success | warning | error
- [x] Alert: added info recipe, destructive kept as alias
- [x] Toast: extended variant union with warning/info, added recipes
- [x] Badge: split axes — variant keeps status, pill/dot become boolean props
- [x] BadgeButton: added error alias
- [x] Migrated 5 demo page usages

**Gate**: ✅ grep for old Badge variant names → only BadgeButton (valid); typecheck green.

---

## Summary

**All Phase A items complete.** 209 tests passing across 29 test files.
Typecheck clean. Ready for Phase B (engines + behavior).
