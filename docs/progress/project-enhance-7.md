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

## Part 3 — TailAdmin-Inspired Form Element Enhancements

### Reference

Reviewed `https://demo.tailadmin.com/form-elements` and `https://demo.tailadmin.com/form-layout` for patterns missing from the boilerplate.

### Patterns Added

| # | Pattern | Description | New component / page |
|---|---|---|---|
| 1 | **Input Groups** | Prefix/suffix adornments: email `@`, phone country-code picker, URL `http://`, copy-to-clipboard | New `InputGroup` component |
| 2 | **Multiple Select** | Tag/chip-style multi-select with removable items | New `MultiSelectField` component |
| 3 | **Textarea with char count** | Live `{n}/500` counter below textarea | New prop on `TextareaField` |
| 4 | **Password show/hide** | Eye icon toggle inside password field | New prop on `TextField` |
| 5 | **Validation state styling** | Error (red border + message), success (green border), disabled (dimmed) | Style refinements on existing fields |
| 6 | **Checkbox / Radio / Toggle states** | Default, checked, disabled variants in a demo page | New demo sections on `elements` page |

### InputGroup Component Design

```tsx
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
├── elements-inits.ts           # Default values
├── elements-validation.ts      # Per-field onChange schemas

src/views/forms/
└── elements/
    └── PageContent.tsx         # New /v1/en/forms/elements page

src/constants/forms-gallery.ts  # +1 entry
messages/{en,tr}/forms/messages.json  # + keys
```

---

## Part 4 — Form Layouts Page

### Layout Patterns Added

| # | Pattern | Description | Layout |
|---|---|---|---|
| 1 | **Contact Form** | Basic single-column: Full Name, Email, Subject (select), Message (textarea) | Card, vertical stack |
| 2 | **Two-Column Grid** | Side-by-side names + full-width email, subject, message | `grid grid-cols-1 sm:grid-cols-2` |
| 3 | **Icon-Prefixed** | Inputs with leading SVG icons + Remember me checkbox | Each input with icon prefix |
| 4 | **Sectioned Card Form** | 3 sections: Personal Info (+ DOB, Category) → Address → Membership | 3 sections with headers |

---

## Part 5 — Convention Compliance Refactoring

Applied AGENTS.md rules to all form page files:

| Rule | Files Fixed | Detail |
|---|---|---|
| Inline prop types → `src/types/` | `elements/PageContent.tsx`, `layouts/PageContent.tsx` | Extracted `SectionCardProps` → `SectionCard-types.ts`, `LayoutCardProps` → `LayoutCard-types.ts` |
| Inline Zod schemas → `src/validators/` | `elements/PageContent.tsx`, `layouts/PageContent.tsx` | Extracted 5 inline `useMemo + z.object()` blocks to `elements-validation.ts`, `layouts-validation.ts` |

### Remaining convention violations (not in scope)
- `field-states/PageContent.tsx`: `StateCard` inline props + 1 inline Zod schema
- All form pages exceed ~150-line threshold (codebase-wide pattern, not addressed)

---

## Part 6 — TailAdmin Pattern Refinements (Iteration 2)

After the initial TailAdmin-inspired implementation, a second iteration brought pages closer to the reference:

### Form Elements — New sections added

| Section | What | Details |
|---|---|---|
| **Default Inputs** | Input, placeholder, select, password, date, time | 6 native input types in a responsive grid |
| **File Input** | Styled upload button | Hidden input + custom label with upload icon |
| **Dropzone** | Drag & drop file upload | Using existing `FileUpload` component (PNG/JPG/PDF, 5MB) |
| **Date & Time Pickers** | Native date + time inputs | Wrapped in TanStack Form's `AppField` + `AppForm` |
| **Card Number** | Input Group variant | Credit card icon prefix, `4242 4242 4242 4242` placeholder |
| **Amount** | Input Group variant | `$` prefix + `USD` suffix |

### Form Layouts — Reworked to match TailAdmin

| Layout | Before | After |
|---|---|---|
| **Basic Stacked** | Full Name, Email, Password, Confirm Password | **Contact Form**: Full Name, Email, Subject (NativeSelect), Message (TextareaField) |
| **Two-Column Grid** | First/Last/Email/Phone (2-col) | First/Last (2-col) + Email + Subject (select) + Message (textarea) + Send Message submit |
| **Icon-Prefixed** | Name, Email, Password with icons | + **Remember me** Checkbox + Create Account submit |
| **Sectioned Card** | Personal Info + Address + Membership | + **Date of Birth** (date input) + **Category** (radio: Technology/Design/Business) |

---

## Enhancement Opportunities

### Form Elements (`/v1/en/forms/elements`) — 539 lines

| Opportunity | Effort | Impact |
|---|---|---|
| **Keyboard date picker** (react-day-picker v10 like `Calendar` component) | Medium | Better UX than native `<input type="date">` |
| **Phone input with flag + formatting** (country flag, auto-format) | High | Real-world pattern many apps need |
| **Range slider** (min/max with tooltip) | Medium | Common in filters/pricing |
| **Color picker** (native or custom swatches) | Low | Quick win for theme builders |
| **Split section sub-components** into separate files (currently all in PageContent.tsx) | Medium | Convention compliance, readability |
| **Tests for InputGroup, MultiSelectField, TextField password toggle, TextareaField char count** | Medium | Already noted as "future" in scope |

### Form Layouts (`/v1/en/forms/layouts`) — 498 lines

| Opportunity | Effort | Impact |
|---|---|---|
| **Floating label pattern** (label animates to top on focus) | Medium | Polished UX, TailAdmin reference |
| **Wizard / Multi-step layout** (step indicator + prev/next + conditional sections) | High | Complex flow reference pattern |
| **Inline form layout** (label beside field on same row) | Low | Quick variant of basic form |
| **Form with sidebar** (field categories in left nav, content on right) | High | Enterprise admin pattern |
| **Split 4 layout sub-components** into separate files | Medium | Convention compliance |

### Field States (`/v1/en/forms/field-states`) — 502 lines

| Opportunity | Effort | Impact |
|---|---|---|
| **Extract `StateCard` inline prop types** | Low | Convention compliance |
| **Extract inline Zod schema** | Low | Convention compliance |

---

## File Inventory (All Commits)

| Commit | Files | Description |
|---|---|---|
| `ed86ef7` | `form-field-info.tsx`, `FormFieldInfo-types.ts`, `form-field-info.test.tsx` | Fix ZodIssue crash |
| `945f3ef` | `advanced/PageContent.tsx`, `validators/forms/advanced.ts`, `advanced-inits.ts`, route page, gallery, i18n | Advanced Form Patterns page |
| `09dbc3f` | Part 3 + Part 4: InputGroup, MultiSelectField, elements/layouts pages, TextField/TextareaField props, gallery, i18n | Form element enhancements + layout patterns |
| `4c9c0f4` | `layouts/PageContent.tsx` | Fix `form.SubmitButton` → `form.AppForm` context wrapper |
| `1af8a29` | `elements/PageContent.tsx`, `layouts/PageContent.tsx`, `validators/forms/layouts-inits.ts` | TailAdmin pattern refinement iteration |
| `d44a790` | `SectionCard-types.ts`, `LayoutCard-types.ts`, `elements-validation.ts`, `layouts-validation.ts`, elements/layouts pages | Extract inline prop types + Zod schemas per conventions |

### New files created

| File | Purpose |
|---|---|
| `features/forms/ui/InputGroup.tsx` | Prefix/suffix adornment wrapper (compound component) |
| `features/forms/ui/MultiSelectField.tsx` | Tag/chip multi-select form field (Popover + Checkbox) |
| `types/forms/InputGroup-types.ts` | InputGroup type definitions |
| `types/forms/MultiSelectField-types.ts` | MultiSelectField type definitions |
| `types/forms/SectionCard-types.ts` | SectionCardProps for elements demo |
| `types/forms/LayoutCard-types.ts` | LayoutCardProps for layouts demo |
| `validators/forms/elements.ts` | Zod schemas for Form Elements demo |
| `validators/forms/elements-inits.ts` | Default values for elements form |
| `validators/forms/elements-validation.ts` | Per-field onChange Zod schemas |
| `validators/forms/layouts.ts` | Zod schemas for Form Layouts demo |
| `validators/forms/layouts-inits.ts` | Default values for layouts forms |
| `validators/forms/layouts-validation.ts` | Per-field onChange Zod schemas |
| `views/forms/elements/PageContent.tsx` | Form Elements demo page |
| `views/forms/layouts/PageContent.tsx` | Form Layouts demo page |
| `app/v1/[lang]/forms/elements/page.tsx` | Route page + metadata |
| `app/v1/[lang]/forms/layouts/page.tsx` | Route page + metadata |

### Modified files

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
| `validators/forms/layouts-inits.ts` | Updated default values for reworked layout forms |

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
- [ ] Verify `/v1/en/forms/field-states` no longer crashes — requires running backend (auth dependency)
- [ ] Verify `/v1/en/forms/advanced` renders correctly — requires running backend (auth dependency)
- [ ] Verify `/v1/en/ui/alert?tab=popup-alerts` pattern still works — requires running backend (auth dependency)

### Part 3 — Form Elements (Completed)
- [x] `InputGroup` component (prefix/suffix adornments)
- [x] `MultiSelectField` component (tag/chip multi-select)
- [x] `TextareaField` char count prop (`maxLength`)
- [x] `TextField` password toggle prop (`showPasswordToggle`)
- [x] Validation state styling (error/success/disabled borders — demo page)
- [x] Form Elements demo page (`/v1/en/forms/elements`)
- [x] Gallery entry + i18n messages (en + tr)
- [x] Default Inputs section (text, placeholder, select, password, date, time)
- [x] File Input section (styled upload button)
- [x] Dropzone section (FileUpload component)
- [x] Date & Time Pickers section (native inputs)
- [x] Card Number + Amount Input Group variants
- [ ] Tests for new components (future)

### Part 4 — Form Layouts (Completed)
- [x] Layouts demo page (`/v1/en/forms/layouts`)
- [x] Contact Form (Full Name, Email, Subject select, Message textarea)
- [x] Two-column grid form (names grid + email/subject/message)
- [x] Icon-prefixed inputs form (+ Remember me checkbox)
- [x] Sectioned card form (Personal Info + DOB + Category → Address → Membership)
- [x] Gallery entry + i18n messages (en + tr)

### Part 5 — Convention Compliance (Completed)
- [x] `SectionCardProps` extracted to `src/types/forms/SectionCard-types.ts`
- [x] `LayoutCardProps` extracted to `src/types/forms/LayoutCard-types.ts`
- [x] Inline Zod schemas from elements page → `src/validators/forms/elements-validation.ts`
- [x] Inline Zod schemas from layouts page → `src/validators/forms/layouts-validation.ts`
