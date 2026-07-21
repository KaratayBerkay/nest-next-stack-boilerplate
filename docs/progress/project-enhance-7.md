# Project Enhance 7 — Forms: Error Handling & Real-World Enriched Examples

## Part 1 — Bugfix: ZodIssue Objects Crash FormFieldInfo

### Problem

`/v1/en/forms/field-states` crashes with `"Minified React error #31"` (Objects not valid as a React child) when Zod validation fails on form fields.

**Root cause:** `FormFieldInfo` at `src/components/ui/form-field-info/form-field-info.tsx:21` renders `field.state.meta.errors[0]` directly as a React child. When TanStack Form runs Zod validators, it stores the raw **`ZodIssue` object** (`{code, message, path, ...}`) in the errors array. Rendering a JS object throws React error #31.

### Files affected

| File | Issue |
|---|---|
| `src/components/ui/form-field-info/form-field-info.tsx` | Reads `errors[0]` and renders `{error}` unsafely |
| `src/types/ui/FormFieldInfo-types.ts` | Declares `errors: string[]`, masking the runtime type |
| `src/components/ui/form-field-info/form-field-info.test.tsx` | Only tested string errors |
| All forms using Zod validators via `useAppForm` | `field-states`, `profile`, `advanced` |

### Fix

Added a `toErrorString` helper in `FormFieldInfo`:

```tsx
function toErrorString(err: unknown): string | undefined {
  if (typeof err === "string") return err;
  if (err && typeof err === "object" && "message" in err)
    return String(err.message);
  return undefined;
}
```

Type broadened from `errors: string[]` to `errors: Array<string | { message?: string }>`. New test case covers object errors with `.message`.

**Commit:** `ed86ef7`

---

## Part 2 — Enriched Form Examples Architecture

### Goal

Build real-world enriched form examples that other applications can reference when building complex forms. The boilerplate should demonstrate 3 patterns missing from existing examples:

| # | Pattern | Existing coverage | New coverage |
|---|---|---|---|
| 1 | **Server error → inline field mapping** | `profile` uses it partially; `error-lab` shows JSON | `advanced` page: `exceptionToFormErrors()` maps API errors to individual fields |
| 2 | **Conditional field visibility** | `checkout` has billing toggle; `content-editor` has schedule toggle | `advanced` page: Personal/Business account type shows/hides company fields |
| 3 | **Array sub-forms (add/remove)** | `editable-table` has array rows | `advanced` page: Team Members with add/remove, per-row validation |
| 4 | **Form-level error display** | `checkout` uses it | `advanced` page: `FormLevelError` shown both above fields and above submit |
| 5 | **Simulated API errors demonstrating flow** | `error-lab` standalone | `advanced` page: full submit flow with try/catch/`exceptionToFormErrors`/`setFieldMeta` |

### Architecture

```
src/
├── validators/forms/
│   ├── advanced.ts            # Zod schemas for all fields + members sub-schema
│   └── advanced-inits.ts      # Default values + formOptions export
├── views/forms/
│   └── advanced/
│       └── PageContent.tsx    # Main page component (262 lines)
├── app/v1/[lang]/forms/
│   └── advanced/page.tsx      # Server component route with metadata
└── constants/forms-gallery.ts # +1 entry in FORMS_EXAMPLES
```

### New Page: Advanced Form Patterns (`/v1/en/forms/advanced`)

**Route:** `src/app/v1/[lang]/forms/advanced/page.tsx`  
**View:** `src/views/forms/advanced/PageContent.tsx`

#### Sections

1. **Account Type** — RadioGroupField (Personal / Business). Business selection reveals:
   - Company Name (TextField, required)
   - Tax ID (TextField, regex-validated: `^[A-Z]{2}\d{2,13}[A-Z0-9]$`)
   - Industry (SelectField, 6 options)
   Personal selection hides all three fields.

2. **Personal Info** — Full Name, Email, Password. All with Zod onChange validators.

3. **Team Members** — Array sub-form with add/remove:
   - Each member: Name (TextField), Email (TextField), Role (SelectField: Developer/Designer/Manager/Viewer)
   - "Add Member" button appends `{ name: "", email: "", role: "" }`
   - Per-row remove button highlights the member number
   - Uses `form.pushFieldValue("members", ...)` / `form.removeFieldValue("members", i)`

4. **Submit Flow** (key educational pattern):
   ```tsx
   async function handleAdvancedSubmit({ value }, deps) {
     try {
       await deps.simulateError("email-taken");
       deps.toast({ description: deps.saveSuccess });
       return null;
     } catch (err) {
       const exc = (err as { exception?: ExceptionResponse }).exception;
       if (!exc) return { form: deps.unknownError, fields: {} };
       const { form: formError, fields } = exceptionToFormErrors(exc, deps.allMessages);
       if (formError) return { form: formError, fields };
       return { form: deps.formErrors, fields };
     }
   }
   ```
   - `simulateError("email-taken")` produces an `ExceptionResponse` with `{ exc, msg, field: "email", key: "errors.emailAlreadyMember" }`
   - `exceptionToFormErrors()` maps the `fields` array to `Record<string, string>` keyed by field path
   - TanStack Form's `onSubmitAsync` runs before `onSubmit`, so the returned `fields` are set as field meta errors
   - `form.state.error` string is set for the form-level `FormLevelError`

#### Data Flow Diagram

```
User clicks Submit
  │
  ▼
onSubmitAsync validator fires
  │
  ▼
handleAdvancedSubmit()
  ├─ simulateError("email-taken") ──► catches exception
  │                                      │
  │                                      ▼
  │                               exceptionToFormErrors()
  │                                      │
  │                                      ├─ form: string | null
  │                                      └─ fields: Record<string, string>
  │                                      │
  │                                      ▼
  │                               Returns { form, fields }
  │                                      │
  ▼                                      ▼
onSubmitAsync resolves with { form, fields }
  │
  ├─ form.state.error = form string ──► FormLevelError renders it
  ├─ field.meta.errors = fields[field] ──► FormFieldInfo renders inline
  │
  ▼
onSubmit fires (only if no errors)
  └─ toast success
```

### I18n Messages Added

**`messages/{en,tr}/forms/messages.json`** — `advanced` section (32 keys):
- Section labels: `heading`, `accountType`, `personal`, `business`, `teamMembers`
- Field labels: `fullName`, `email`, `password`, `companyName`, `taxId`, `industry`
- Member fields: `memberName`, `memberEmail`, `memberRole`
- Actions: `addMember`, `removeMember`, `submit`, `submitting`
- Validation messages: `fullNameMin`, `emailInvalid`, `passwordMin`, etc.
- Feedack: `submitSuccess`, `submitFailed`, `emailAlreadyMember`, `formErrors`

### Gallery Integration

`src/constants/forms-gallery.ts` entry:
```ts
{
  name: "Advanced Patterns",
  slug: "advanced",
  mode: "simulated",
  titleKey: "advancedTitle",
  descKey: "advancedDescription",
}
```

Badge shows "Simulated" since the API call is a `simulateError` demo.

i18n examples keys added:
- `en`: `"advancedTitle": "Advanced Patterns"`, `"advancedDescription": "Conditional fields, server error mapping, array sub-forms"`
- `tr`: `"advancedTitle": "Gelişmiş Desenler"`, `"advancedDescription": "Koşullu alanlar, sunucu hata yönetimi, dizi alt formlar"`

---

## Scope

- [x] `FormFieldInfo` — safe rendering of both string and object errors
- [x] Type definition — reflects that `meta.errors` can contain non-strings
- [x] Test — new `"renders object error with message property"` case
- [x] Advanced Form Patterns page — conditional fields, server error mapping, array sub-forms
- [x] Zod schemas + validators in `src/validators/forms/`
- [x] Route page with `generateMetadata`
- [x] Gallery entry + i18n messages (en + tr)
- [x] All 307 tests pass, 0 lint errors, 0 tsc errors
- [ ] Verify `/v1/en/forms/field-states` no longer crashes
- [ ] Verify `/v1/en/forms/advanced` renders correctly
- [ ] Verify `/v1/en/ui/alert?tab=popup-alerts` pattern still works

---

## Part 3 — TailAdmin-Inspired Form Element Enhancements

### Reference

Reviewed `https://demo.tailadmin.com/form-elements` and `https://demo.tailadmin.com/form-layout` for patterns missing from the boilerplate.

### Patterns to Add

| # | Pattern | Description | New component / page |
|---|---|---|---|
| 1 | **Input Groups** | Prefix/suffix adornments: email `@`, phone country-code picker, URL `http://`, copy-to-clipboard | New `InputGroup` component or variants on `TextField` |
| 2 | **Multiple Select** | Tag/chip-style multi-select with removable items | New `MultiSelectField` component |
| 3 | **Textarea with char count** | Live `{n}/500` counter below textarea | New prop on `TextareaField` |
| 4 | **Password show/hide** | Eye icon toggle inside password field | New prop on `TextField` |
| 5 | **Validation state styling** | Error (red border + message), success (green border), disabled (dimmed) | Style refinements on existing fields |
| 6 | **Checkbox / Radio / Toggle states** | Default, checked, disabled variants in a demo page | New demo sections on `field-states` page |

### File Plan

```
src/features/forms/ui/
├── InputGroup.tsx              # Prefix/suffix adornment wrapper
├── MultiSelectField.tsx        # Tag-style multi-select
├── TextareaField.tsx           # + charCount prop
├── TextField.tsx               # + passwordToggle, prefixIcon, suffixIcon props

src/types/forms/
├── InputGroup-types.ts
├── MultiSelectField-types.ts

src/validators/forms/
├── elements.ts                 # Zod schemas for form-elements demo page
└── elements-inits.ts           # Default values

src/views/forms/
└── elements/
    └── PageContent.tsx         # New /v1/en/forms/elements page

src/constants/forms-gallery.ts  # +1 entry
messages/{en,tr}/forms/messages.json  # + keys
```

### InputGroup Component Design

```tsx
// Prefix: static text, icon, or select
// Suffix: button, icon, or text
<InputGroup>
  <InputGroup.Prefix>@</InputGroup.Prefix>
  <TextField />
</InputGroup>

<InputGroup>
  <TextField type="password" />
  <InputGroup.Suffix>
    <EyeIcon />
  </InputGroup.Suffix>
</InputGroup>
```

### MultiSelectField Component Design

- Dropdown with checkboxes
- Selected items rendered as removable chips below the trigger
- Uses TanStack Form's `field.value: string[]`

### New Page: Form Elements (`/v1/en/forms/elements`)

Sections (mirroring TailAdmin's layout):

1. **Input Groups** — email with `@`, phone with country picker, URL with `http://`, copy-button
2. **Select Inputs** — single select, multi-select with chips
3. **Textarea** — basic + with char count (100/200/500 variants)
4. **File Input** — styled upload button with filename display
5. **Checkboxes** — default, checked, disabled, indeterminate
6. **Radio Buttons** — default, selected, disabled
7. **Toggle Switches** — default, checked, disabled
8. **Input States** — error (red), success (green), disabled

---

## Part 4 — Form Layouts Page

### Goal

Create a `/v1/en/forms/layouts` page demonstrating 4 common form layout patterns found in admin dashboards.

### Layout Patterns

| # | Pattern | Description | Layout |
|---|---|---|---|
| 1 | **Basic Stacked** | Single-column fields, full-width inputs | One card, vertical stack |
| 2 | **Two-Column Grid** | Side-by-side fields (first/last name, city/state) | `grid grid-cols-1 sm:grid-cols-2 gap-4` |
| 3 | **Icon-Prefixed** | Inputs with leading SVG icons (user, mail, lock) | Each input wrapped with icon prefix |
| 4 | **Sectioned Card Form** | Multiple card sections (Personal Info → Address → Membership) | 3 cards with section headers |

### File Plan

```
src/views/forms/
└── layouts/
    └── PageContent.tsx         # New /v1/en/forms/layouts page

src/validators/forms/
├── layouts.ts                  # Zod schemas for each layout form
└── layouts-inits.ts            # Default values

src/constants/forms-gallery.ts  # +1 entry
messages/{en,tr}/forms/messages.json  # + keys
```

---

## Scope

### Part 1 & 2 (Completed)
- [x] `FormFieldInfo` — safe rendering of both string and object errors
- [x] Type definition — reflects that `meta.errors` can contain non-strings
- [x] Test — new `"renders object error with message property"` case
- [x] Advanced Form Patterns page — conditional fields, server error mapping, array sub-forms
- [x] Zod schemas + validators in `src/validators/forms/`
- [x] Route page with `generateMetadata`
- [x] Gallery entry + i18n messages (en + tr)
- [x] All 307 tests pass, 0 lint errors, 0 tsc errors
- [ ] Verify `/v1/en/forms/field-states` no longer crashes
- [ ] Verify `/v1/en/forms/advanced` renders correctly
- [ ] Verify `/v1/en/ui/alert?tab=popup-alerts` pattern still works

### Part 3 — Form Elements (Completed)
- [x] `InputGroup` component (prefix/suffix adornments)
- [x] `MultiSelectField` component (tag/chip multi-select)
- [x] `TextareaField` char count prop (`maxLength`)
- [x] `TextField` password toggle prop (`showPasswordToggle`)
- [x] Validation state styling (error/success/disabled borders — demo page)
- [x] Form Elements demo page (`/v1/en/forms/elements`)
- [x] Gallery entry + i18n messages (en + tr)
- [ ] Tests for new components (future)

### Part 4 — Form Layouts (Completed)
- [x] Layouts demo page (`/v1/en/forms/layouts`)
- [x] Basic stacked form (card)
- [x] Two-column grid form
- [x] Icon-prefixed inputs form
- [x] Sectioned card form (3 sections: Personal Info → Address → Membership)
- [x] Gallery entry + i18n messages (en + tr)

## Files Changed (all commits)

| Commit | Files | Description |
|---|---|---|
| `ed86ef7` | `form-field-info.tsx`, `FormFieldInfo-types.ts`, `form-field-info.test.tsx`, `project-enhance-7.md` | Fix ZodIssue crash + doc |
| `945f3ef` | `advanced/PageContent.tsx`, `advanced.ts`, `advanced-inits.ts`, `advanced/page.tsx`, `forms-gallery.ts`, `messages/en/forms/messages.json`, `messages/tr/forms/messages.json`, `i18n-messages.d.ts`, `project-enhance-7.md` | New Advanced Form Patterns page |
| _(this commit)_ | Part 3 + Part 4 files (see below) | Form element enhancements + layout patterns |

### Files in this commit

**New files:**
| File | Purpose |
|---|---|
| `features/forms/ui/InputGroup.tsx` | Prefix/suffix adornment wrapper (compound component) |
| `features/forms/ui/MultiSelectField.tsx` | Tag/chip multi-select form field (Popover + Checkbox) |
| `types/forms/InputGroup-types.ts` | InputGroup type definitions |
| `types/forms/MultiSelectField-types.ts` | MultiSelectField type definitions |
| `validators/forms/elements.ts` | Zod schemas for Form Elements demo |
| `validators/forms/elements-inits.ts` | Default values for elements form |
| `validators/forms/layouts.ts` | Zod schemas for Form Layouts demo |
| `validators/forms/layouts-inits.ts` | Default values for layouts forms |
| `views/forms/elements/PageContent.tsx` | Form Elements demo page (330 lines) |
| `views/forms/layouts/PageContent.tsx` | Form Layouts demo page (398 lines) |
| `app/v1/[lang]/forms/elements/page.tsx` | Route page + metadata |
| `app/v1/[lang]/forms/layouts/page.tsx` | Route page + metadata |

**Modified files:**
| File | Change |
|---|---|
| `types/forms/TextField-types.ts` | Added `type?` and `showPasswordToggle?` props |
| `types/forms/TextareaField-types.ts` | Added `maxLength?` prop |
| `features/forms/ui/TextField.tsx` | Password toggle via `rightIcon` + internal `visible` state |
| `features/forms/ui/TextareaField.tsx` | Char count display when `maxLength` set |
| `constants/forms-gallery.ts` | +2 entries: `elements`, `layouts` |
| `messages/en/forms/messages.json` | +4 keys for elements/layouts titles + descriptions |
| `messages/tr/forms/messages.json` | +4 Turkish keys for elements/layouts |
| `src/generated/i18n-messages.d.ts` | Regenerated to reflect new message keys |
