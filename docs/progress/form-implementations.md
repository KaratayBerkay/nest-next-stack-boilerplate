# Forms Page — Implementation Plan

## Overview

Add a top-level "Forms" page at `/v1/:lang/forms` that demonstrates complex real-world form patterns using `@tanstack/react-form`. The page uses tabs to switch between self-contained form examples, each usable as boilerplate.

## Route & Nav

```
/v1/:lang/forms
```

- Add `navForms: "Forms"` to `messages/{en,tr}/v1-shell/messages.json`
- Add `{ href: "/forms", label: t.navForms, Icon: IconForms }` to `V1Nav.tsx` (between UI Components and Error Test)
- Register `IconForms` from `@tabler/icons-react`

## Page Structure

### Server page
`src/app/v1/[lang]/forms/page.tsx` — server component:
- `getMessages("forms", lang)` for `generateMetadata`
- Wraps `<FormContent />` with a `<Suspense>` boundary

### Client view
`src/views/forms/PageContent.tsx` — "use client" with tabbed form examples:

The page uses the same `ExampleTabs` pattern from `@/views/ui/_shared/ExampleTabs` with tabs as `UIExample[]`. Each tab's `render` is a self-contained form component from a sibling file.

## Tab Examples

### Tab 1: "User Profile" (Create/Update — sync submit)

**Goal:** Full user profile form demonstrating every input type with field-level validation.

**Fields:**
- `avatar` — ImageUpload (drag-and-drop with preview)
- `firstName`, `lastName` — Input (text)
- `email` — Input (email) with async availability check (debounced)
- `bio` — Textarea (auto-resize, char counter)
- `country` — Combobox (searchable, with grouped options)
- `language` — NativeSelect
- `newsletter` — Switch (toggle)
- `interests` — Checkbox group (multi-select)
- `role` — RadioGroup
- `birthDate` — DatePicker
- `meetingTime` — TimeInput
- `notificationPrefs` — nested object (push email sms) with Switch fields

**Patterns shown:**
- `form.Field` render-prop for each field type
- Zod field schemas per field (onChange + onBlur validators)
- Async validation: debounced email uniqueness check with `validatorAdapter`
- `FieldInfo` sub-component for errors + validation spinner
- `form.Subscribe` for submit button disable during async validation
- Sync `onSubmit` that calls `api/client/profile/actions` `updateProfile`
- Toast on success, Alert on error
- i18n messages for labels, placeholders, errors

### Tab 2: "Team Invite" (Create — async submit with server action)

**Goal:** Multi-step form with server-side validation and progress state.

**Fields:**
- Step 1: `emails` — tag-style multi-email input (InputGroup + chips)
- Step 2: `role` — Select with permission descriptions
- Step 3: `message` — Textarea (optional personal message)
- Step 4: `sendInvite` — Confirm Dialog before final submit

**Patterns shown:**
- Multi-step / wizard form with step indicator
- `useActionState` + TanStack Form server action integration
- `createServerValidate` with Zod schema (server re-validates)
- `ServerValidateError` handling
- Dynamic field arrays (add/remove email chips)
- `form.state.isSubmitting` for loading overlay
- Toast per step completion
- Navigate back/forward between steps preserving state

### Tab 3: "API Key" (Create/Delete — async submit with optimistic updates)

**Goal:** Form that creates a resource and shows it in a list with delete capability.

**Fields:**
- `name` — Input (text, required)
- `expiresIn` — Select (30d / 60d / 90d / never)
- `permissions` — checkbox group with "select all"
- `ipWhitelist` — InputGroup with add/remove (dynamic array of IPs)

**Patterns shown:**
- TanStack Query `useMutation` with `onMutate` optimistic add to list
- `queryClient.setQueryData` for instant UI update
- `queryClient.invalidateQueries` on settle
- Form clears on success
- Delete action with ConfirmDialog
- Toast with undo action
- Masked secret display after creation (copy to clipboard)

### Tab 4: "Billing" (Update/Patch — async submit with dependent fields)

**Goal:** Form with dependent fields, conditional sections, and real-time validation.

**Fields:**
- `plan` — RadioGroup (Free / Basic / Medium / Premium) with pricing cards
- `billingPeriod` — Segmented control (monthly / yearly) — dependent on plan
- `paymentMethod` — Select (existing cards + "add new")
- `couponCode` — Input with async coupon validation on blur
- `taxId` — Input with format validation per country

**Patterns shown:**
- `form.store` subscribing to related field values
- Conditional rendering: coupon section only when coupon input focused
- Dependent validation: taxId required only for certain countries
- Auto-save: debounced `onChange` that calls `PATCH` endpoint
- Patch vs full update: only send changed fields
- Error recovery: retry button on failed save
- Dirty field tracking (`form.state.isDirty`, field `state.meta.isDirty`)

### Tab 5: "Filters" (Read — sync submit, URL-synced)

**Goal:** Complex filter panel synced to URL search params.

**Fields:**
- `search` — Input with debounced onChange
- `category` — Combobox (multi-select)
- `tags` — Tag input with autocomplete
- `dateRange` — DatePicker range
- `sortBy` — Select
- `sortOrder` — Toggle (asc/desc)
- `pageSize` — NativeSelect
- `status` — Checkbox group

**Patterns shown:**
- URL sync: read initial values from `searchParams`, write back via `router.replace`
- `useEffect` to sync form state to URL on debounce
- Reset button to clear all filters
- Persist across page navigation (URL drives initial state)
- No actual API call — just renders filter state as JSON preview

### Tab 6: "Validation Showcase" (All states — sync, no submit)

**Goal:** Reference page showing every possible field state.

**States per field type:**
- Default (empty)
- Filled (valid)
- Error (with message)
- Warning (with message via custom meta)
- Disabled
- Loading (async validating)
- Read-only
- Required indicator

**Patterns shown:**
- All input types in one place
- Programmatic error setting via `field.setMeta`
- Custom meta extension for warning/severity levels
- `aria-invalid`, `aria-describedby` inspection
- Accessibility labels and descriptions

## Files to Create

| # | File | Purpose |
|---|---|---|
| 1 | `src/app/v1/[lang]/forms/page.tsx` | Server page with metadata |
| 2 | `src/views/forms/PageContent.tsx` | Main page with ExampleTabs |
| 3 | `src/views/forms/UserProfileForm.tsx` | Tab 1 — full CRUD profile form |
| 4 | `src/views/forms/TeamInviteForm.tsx` | Tab 2 — multi-step wizard |
| 5 | `src/views/forms/ApiKeyForm.tsx` | Tab 3 — create + optimistic list |
| 6 | `src/views/forms/BillingForm.tsx` | Tab 4 — dependent/patch form |
| 7 | `src/views/forms/FilterPanel.tsx` | Tab 5 — URL-synced filters |
| 8 | `src/views/forms/ValidationShowcase.tsx` | Tab 6 — all field states |
| 9 | `src/types/forms/PageContent-types.ts` | Types for form examples, tab defs |
| 10 | `src/validators/forms/schema.ts` | Zod schemas for all forms |
| 11 | `src/lib/forms/profile-options.ts` | `formOptions` for profile form |
| 12 | `src/lib/forms/invite-options.ts` | `formOptions` for invite form |
| 13 | `src/lib/forms/api-key-options.ts` | `formOptions` for API key form |
| 14 | `src/lib/forms/billing-options.ts` | `formOptions` for billing form |
| 15 | `src/lib/forms/filter-options.ts` | `formOptions` for filter form |
| 16 | `messages/{en,tr}/forms/messages.json` | i18n messages for forms page |

## Files to Modify

| # | File | Change |
|---|---|---|
| 1 | `src/views/v1/[lang]/V1Nav.tsx` | Add `/forms` nav link + `IconForms` import |
| 2 | `messages/{en,tr}/v1-shell/messages.json` | Add `navForms: "Forms"` |

## Reusable Utilities (extract from existing code)

- `FieldInfo` — already in `src/views/(demos)/form/Form.tsx` and `src/types/demos/FieldInfo-types.ts` — lift to `src/components/ui/form-field-info.tsx` for reuse across all forms
- `asyncValidator` helper — debounced async validation wrapper → `src/lib/forms/async-validator.ts`
- `formErrorBanner` — extracted form-level error display → `src/components/ui/form-error-banner.tsx`
- `stepIndicator` — wizard step progress → `src/components/ui/step-indicator.tsx`

## Implementation Order

1. **Prerequisites:** Create `FieldInfo` component, `asyncValidator` utility, `formErrorBanner` component, `stepIndicator` component
2. **Scaffold:** Nav link, i18n keys, server page, `PageContent` with `ExampleTabs`
3. **Tab 6 (Validation Showcase)** — simplest, no logic, pure rendering — establishes all field patterns
4. **Tab 1 (User Profile)** — full CRUD with all input types — establishes the core form pattern
5. **Tab 5 (Filters)** — URL sync pattern — standalone, no API calls
6. **Tab 3 (API Key)** — optimistic mutations — introduces TanStack Query integration
7. **Tab 4 (Billing)** — dependent fields + patch — advanced form dynamics
8. **Tab 2 (Team Invite)** — multi-step + server actions — most complex, last

## Key Conventions to Follow

- All Zod schemas → `src/validators/forms/schema.ts`
- All API calls → through `@/api/client/` (existing pattern)
- All i18n → `useMessages("forms")` with keys in `messages/{en,tr}/forms/messages.json`
- All toasts → `useToast()` from `@/components/ui/toast/use-toast`
- All alerts → `Alert` from `@/components/ui/Alert`
- All types → `src/types/forms/PageContent-types.ts`
- Extract handlers to module-level functions (not inside component)
- Sub-components extracted to sibling files (not inline)
- Form options in `src/lib/forms/` (one file per form type)
- Every form option file validates its `defaultValues` shape matches the Zod schema
- Every form field uses `validators={{ onChange: ..., onBlur: ... }}` for per-field validation
- Every form has both client-side validation (Zod) and server-side validation (where applicable)
