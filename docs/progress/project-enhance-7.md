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

## Files Changed (all commits)

| Commit | Files | Description |
|---|---|---|
| `ed86ef7` | `form-field-info.tsx`, `FormFieldInfo-types.ts`, `form-field-info.test.tsx`, `project-enhance-7.md` | Fix ZodIssue crash + doc |
| _(this commit)_ | `advanced/PageContent.tsx`, `advanced.ts`, `advanced-inits.ts`, `advanced/page.tsx`, `forms-gallery.ts`, `messages/en/forms/messages.json`, `messages/tr/forms/messages.json`, `i18n-messages.d.ts`, `project-enhance-7.md` | New Advanced Form Patterns page |
