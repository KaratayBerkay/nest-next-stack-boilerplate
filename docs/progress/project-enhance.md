# Target Project — Create/Update Mechanics Analysis

> Analyzed 2026-07-19. Compares the NestJS+NextJS boilerplate form patterns
> (rev-11/12, committed `32ca551`+`e2ab2a6`) against the Evyos management
> frontend at `/home/berkay/repos/git-evyos/production-ready-evyos-applications-v2/management/frontend/src`.
> Identifies gaps, similarities, and a recommended migration path for aligning
> the target project with production-ready create/update mechanics.
>
> **Scope:** schema layer, form view layer, API client layer, error handling.
> Does not cover auth, routing, or deployment.

---

## 1. Architecture Overview — Target Project

```
src/
  schemas/<domain>/           ← Zod schemas (validation + response)
    mutation.ts               Core field schemas + createSchema(errors) factory
    create.ts                 createRequestSchema = { data: mutationSchema, ... }
    update.ts                 partial mutation + uuid + superRefine
    list.ts                   Re-exports pagination list request schema
    row.ts                    Response row + createResponseSchema / updateResponseSchema / etc.
    inits.ts                  createInitialValues(row?) for form defaults
  queries/
    server/<domain>/          createServerFn (TanStack Start) → graphqlFetcher()
    client/<domain>/query.ts  useQuery hooks (list + find)
    client/<domain>/mutation.ts useMutation hooks (create + update)
  components/form/            useAppForm (TanStack React Form)
    SubmitButton / FormHeader / FormInfo
  views/forms/                Form view pages (mode: "create" | "update")
  lib/form.ts                 getFieldError, createApiMessageWithLang
  types/form/                 ApiErrorBucket, SectionMessages
```

### 1.1 Schema Layer — Detailed (`src/schemas/building/`)

| File | Pattern |
|---|---|
| `mutation.ts` | Core fields with helpers (`requiredString`, `requiredInteger`, `optionalUuidString`). Exports `buildMutationSchema` + `createSchema(errors)` factory |
| `create.ts` | `createRequestSchema = z.object({ data: buildMutationSchema, siteGovAddressCode, buildTypesUUID })` |
| `update.ts` | `buildUpdateDataSchema = buildMutationSchema.partial().extend({ isActive, isConfirmed, isDeleted }).superRefine(at-least-one-field)` + `updateRequestSchema = validatedUUIDSchema.extend({ data: buildUpdateDataSchema, ... })` |
| `row.ts` | Full response schema (`uuid`, `name`, `maxFloor`, …) + `listSchema`, `createResponseSchema`, `updateResponseSchema`, `findResponseSchema` |
| `inits.ts` | `defaultValues: schemaInputType` + `createInitialValues(building?)` — returns defaults or maps existing record to form shape |

### 1.2 Form View Layer (`activity-form-page.tsx`)

```tsx
type ActivityFormPageProps = {
  activityId?: string
  initialValues?: ActivityFormValues
  mode: 'create' | 'update'
}
```

- Schema built inline via `buildSchema(t)` — not in `src/schemas/`
- `onSubmit` **inline** (not extracted as module-level function)
- Uses `useAppForm` from `@tanstack/react-form`
- MUI `TextField`, `Select`, `Switch` via `form.AppField`
- Preview record created after submit
- No real API call (demo data only)

### 1.3 API Client Layer (`src/queries/`)

- **Server:** `createServerFn({ method: 'POST' }).inputValidator(schema).handler(async (ctx) => { ... })` wrapping `graphqlFetcher()` with raw GraphQL queries
- **Client query:** `useBuildingList` → `usePaginatedList`, `useGraphQlBuildingFind` → `useQuery`
- **Client mutation:** `useGraphQlBuildingCreate` / `useGraphQlBuildingUpdate` → `useMutation` with `onSuccess: () => queryClient.invalidateQueries(...)`
- **Error response:** `EntityClientResponse<T>` — discriminated union `{ error: false, data: T }` | `{ error: true, bucket: ApiErrorBucket }` — no exception throwing

---

## 2. Boilerplate vs Target — Side by Side

| Aspect | Boilerplate (`nest-next-stack`) | Target Project (`evyos`) | Δ |
|---|---|---|---|
| **Form library** | `@tanstack/react-form` + `useAppForm` | `@tanstack/react-form` + `useAppForm` | ✅ Same |
| **HTTP client** | `apiFetch` / `apiFetchJson` (raw fetch) | `createServerFn` + `graphqlFetcher` (TanStack Start) | 🔄 Different stacks |
| **API response type** | `ExceptionResponse` (thrown, caught) | `EntityClientResponse<T>` (discriminated union) | ⚠️ Different philosophy |
| **Error → form mapping** | `exceptionToFormErrors(exc, messages)` → `{ form, fields }` | `createApiMessageWithLang(fieldLabels, errorMessages, apiError)` → bucket messages | ⚠️ Both exist, different shapes |
| **Schema location** | `src/validators/<domain>/<file>.ts` factory functions | `src/schemas/<domain>/mutation.ts` + `create.ts` + `update.ts` | 🔄 Different naming, same concept |
| **Create/Update schema** | Same schema for both | **Separate** — `create.ts` full, `update.ts` partial+uuid+superRefine | ✅ Target more rigorous |
| **Initial values** | `formOptions({ defaultValues })` with static object | `createInitialValues(row?)` — default or from existing record | ✅ Target more flexible |
| **Form schema factory** | `createXFieldSchemas(t: Record<string,string>)` in validators/ | `createSchema(errors: (key) => string)` in mutation.ts + `buildSchema(t)` inline in view | ✅ Conceptually same |
| **Submit handler** | **Module-level** extracted function | **Inline** in component body | ❌ Target should extract |
| **Response schemas** | Yes — `createResponseSchema`, `updateResponseSchema` in server layer | Yes — in `row.ts` per domain | ✅ Present in both |
| **Input validation** | Server layer validates with zod before API call | `createServerFn` `.inputValidator(schema)` | ✅ Present in both |
| **Cache invalidation** | Manual `invalidateQueries` in client actions hook | `useMutation` `onSuccess` callback | ✅ Both patterns |
| **File naming convention** | `api/server/<domain>/<action>.ts` + `api/client/<domain>/actions.ts` | `queries/server/<domain>/<action>.ts` + `queries/client/<domain>/mutation.ts` | 🔄 Different naming |
| **i18n** | `useTranslations` → `Record<string, string>` → factory | `useTranslations` → `t(key)` → inline `buildSchema(t)` | ✅ Both support i18n |

---

## 3. Required Changes — Detailed

### 3.1 Extract Submit Handlers to Module Level

**Why:** Inline `onSubmit` handlers in the component body force recreating the function on every render, prevent independent testing, and accumulate complexity as the handler grows.

**Current (target):**
```tsx
export default function ActivityFormPage({ ... }) {
  const form = useAppForm({
    onSubmit: async ({ value }) => {
      const payload = schema.parse(value)
      setPreview(createPreviewRecord(payload, activityId))
      if (mode === 'update') { form.reset(payload) }
    },
  })
}
```

**Required:**
```tsx
// Module-level handler
async function handleActivitySubmit(
  value: ActivityFormValues,
  mode: 'create' | 'update',
  activityId: string | undefined,
  setPreview: Dispatch<SetStateAction<ActivityRecord | null>>,
  form: ReturnType<typeof useAppForm>,
) {
  // 1. Zod parse
  // 2. Call API (create or update based on mode)
  // 3. Handle success → preview / toast
  // 4. Handle error → map to form fields
  const payload = schema.parse(value)
  setPreview(createPreviewRecord(payload, activityId))
  if (mode === 'update') { form.reset(payload) }
}

// In component:
const form = useAppForm({
  onSubmit: async ({ value }) => {
    await handleActivitySubmit(value, mode, activityId, setPreview, form)
  },
})
```

**Files to touch:** Every `src/views/forms/*/PageContent.tsx` that uses `useAppForm` with inline `onSubmit`.

### 3.2 Move Schema Factories from Views to `src/schemas/`

**Why:** Boilerplate convention keeps all zod schemas in dedicated files, not inline in views. The target already has `src/schemas/` with excellent structure — the views should reuse it rather than define `buildSchema(t)` inline.

**Current (target):**
```tsx
// activity-form-page.tsx — inline schema
function buildSchema(t: (key: string) => string) {
  return z.object({
    title: z.string().trim().min(3, t('title-min')),
    owner: z.string().trim().min(2, t('owner-min')),
    // ...
  })
}
```

**Required:**
```ts
// src/schemas/activities/mutation.ts
export function createActivitySchema(t: (key: string) => string) {
  return z.object({
    title: z.string().trim().min(3, t('title-min')),
    owner: z.string().trim().min(2, t('owner-min')),
    // ...
  })
}

// src/schemas/activities/inits.ts
export const defaultActivityFormValues = { ... }

// src/schemas/activities/create.ts
import { createActivitySchema } from './mutation'
// ...

// In view:
import { createActivitySchema } from '@/schemas/activities/mutation'
import { defaultActivityFormValues } from '@/schemas/activities/inits'

const schema = useMemo(() => createActivitySchema(t), [t])
const form = useAppForm({ defaultValues: defaultActivityFormValues, validators: { ... } })
```

**Convention:** Boilerplate puts factory functions in validators/ forms → adapt as `src/schemas/<domain>/mutation.ts` using the existing pattern (`createSchema(errors)` → `createActivitySchema(t)`).

### 3.3 Wire API Error Mapping to Form Fields

**Why:** The boilerplate's `exceptionToFormErrors(exc, messages)` maps backend field-level errors to specific form fields via the `fields[]` array in the error envelope. The target's `EntityClientResponse.bucket` pattern is cleaner but needs to be plumbed through the form's error state.

**Current (target):**
```ts
// lib/form.ts
export function createApiMessageWithLang(
  fieldLabels: Record<string, string>,
  errorMessages: Record<string, string>,
  apiError: unknown,
): string | undefined
```

**Required:** Either (a) extend `createApiMessageWithLang` to return `{ form: string | null, fields: Record<string, string> }` matching the boilerplate's `exceptionToFormErrors` shape, or (b) create a new `apiErrorToFormErrors(bucket, messages)` that TanStack Form's `onSubmitAsync` can return.

The form integration should look like:
```tsx
const form = useAppForm({
  validators: {
    onSubmitAsync: async ({ value }) => {
      try {
        const result = await createActivity(value)
        if (result.error) {
          return formErrorUtils(result.bucket, allMessages) // { form, fields }
        }
        return null
      } catch (err) {
        return { form: 'An unexpected error occurred', fields: {} }
      }
    },
  },
})
```

### 3.4 Standardize Two-Layer API Naming

**Why:** The target's `src/queries/server/` + `src/queries/client/` pattern works but diverges from the boilerplate's `src/api/server/` + `src/api/client/` naming. Both are valid — the key is consistency within the project.

**Observation:** The target already has a solid two-layer architecture:
- Server: `createServerFn` → `graphqlFetcher`
- Client: `useMutation` / `useQuery`

No structural change needed here. The existing pattern is production-ready.

### 3.5 Create/Update Schema Pattern — Keep as Is

**Why:** The target's `src/schemas/<domain>/create.ts` vs `update.ts` separation is actually **more rigorous** than the boilerplate (which uses a single schema for both). Key strengths:

| Feature | Target `update.ts` | Boilerplate |
|---|---|---|
| All fields optional | ✅ `.partial()` | N/A (single schema) |
| UUID required | ✅ `validatedUUIDSchema` | Passed as separate param |
| Status flags on update only | ✅ `.extend({ isActive, isConfirmed, isDeleted })` | N/A |
| At-least-one-field guard | ✅ `.superRefine()` | N/A |

**Recommendation:** Keep the target's create/update schema separation. It is the superior pattern.

### 3.6 `inits.ts` — The `createInitialValues` Pattern

**Why:** The target's `inits.ts` pattern (`createInitialValues(record?) → default or mapped values`) elegantly solves the dual-purpose of form initial values:
- **Create mode:** `createInitialValues()` → returns sanitized defaults
- **Update mode:** `createInitialValues(existingRecord)` → maps server row → form values

The boilerplate uses static `defaultValues` in `formOptions()`. For the update case, it relies on `reset()` with fetched data.

**Recommendation:** Keep and extend this pattern. Every domain should have an `inits.ts` with:
```ts
export const defaultValues: schemaInputType = { ... }
export function createInitialValues(record?: schemaType): schemaInputType {
  if (!record) return { ...defaultValues, dates: toDateTimeLocalValue(...) }
  return { field1: record.field1, field2: record.field2, ... }
}
```

---

## 4. Concrete Changes Checklist

### Priority 1 — Align form views with boilerplate conventions

| # | File | Change | Pattern |
|---|---|---|---|
| P1 | `views/forms/activity-form-page.tsx` | Extract `onSubmit` to module-level `handleActivityFormSubmit` | Boilerplate O3 |
| P2 | `views/forms/activity-form-page.tsx` | Move `buildSchema(t)` to `schemas/activities/mutation.ts` | Boilerplate O1 |
| P3 | `views/forms/activity-form-page.tsx` | Create `schemas/activities/inits.ts` with `defaultActivityFormValues` + `createInitialValues()` | Target's existing `inits.ts` pattern |
| P4 | All form views | Extract `onSubmit` handlers to module-level functions | Boilerplate O3 |

### Priority 2 — Error mapping integration

| # | File | Change | Pattern |
|---|---|---|---|
| P5 | `lib/form.ts` or new `lib/form-errors.ts` | Add `apiErrorToFormErrors(bucket, messages) → { form, fields }` | Boilerplate's `exceptionToFormErrors` |
| P6 | `components/form/FormInfo.tsx` | Ensure it consumes the mapped field errors from form state | Boilerplate O6 |
| P7 | `queries/client/**/mutation.ts` | Standardize `useMutation` error handling to return `EntityClientResponse` consistently | Target's existing pattern |

### Priority 3 — Schema organization

| # | File | Change | Pattern |
|---|---|---|---|
| P8 | `schemas/<domain>/` | Audit every domain: ensure `create.ts`, `update.ts`, `row.ts`, `inits.ts`, `mutation.ts`, `list.ts` exist | Target's existing pattern |
| P9 | `schemas/activities/` | **Create new domain** following the building pattern | Target's building pattern |

### Priority 4 — Form component refinements

| # | File | Change | Pattern |
|---|---|---|---|
| P10 | `components/form/` | Add `formOptions` equivalent or ensure `useAppForm` accepts `validators.onSubmitAsync` returning `{ form, fields }` | Boilerplate O2 |
| P11 | `views/forms/*` | Wire `validators.onSubmitAsync` with `apiErrorToFormErrors` for field-level API error mapping | Boilerplate O6 |

---

## 5. Reference Implementation — Full Domain Example

### New domain: `schemas/activities/`

```ts
// schemas/activities/mutation.ts
import { z } from 'zod'
import { ACTIVITY_CHANNELS, ACTIVITY_STATUSES } from './constants'

export function createActivitySchema(t: (key: string) => string) {
  return z.object({
    title: z.string().trim().min(3, t('title-min')),
    owner: z.string().trim().min(2, t('owner-min')),
    channel: z.enum(ACTIVITY_CHANNELS),
    status: z.enum(ACTIVITY_STATUSES),
    urgent: z.boolean(),
    notes: z.string().trim().min(10, t('notes-min')),
    followUpAt: z.string().min(1, t('followUpAt-required'))
      .refine((value) => !Number.isNaN(new Date(value).getTime()), { message: t('followUpAt-invalid') }),
  })
}

export type ActivityFormValues = z.infer<ReturnType<typeof createActivitySchema>>
```

```ts
// schemas/activities/row.ts
import { z } from 'zod'
import { paginatedList } from '#/schemas/commons/pagination'

export const schema = z.object({
  id: z.string(),
  title: z.string(),
  owner: z.string(),
  channel: z.string(),
  status: z.string(),
  urgent: z.boolean(),
  notes: z.string(),
  followUpAt: z.string(),
  updatedAt: z.string(),
})

export const listSchema = paginatedList(schema)
export const createResponseSchema = z.object({ data: z.object({ createActivity: schema }) })
export const updateResponseSchema = z.object({ data: z.object({ updateActivity: schema }) })
export type ActivityRow = z.infer<typeof schema>
```

```ts
// schemas/activities/create.ts
import { z } from 'zod'
import { createActivitySchema } from './mutation'

export const createRequestSchema = z.object({
  data: createActivitySchema(() => ''), // base schema; runtime errors from factory
})

export type CreateActivityRequest = z.infer<typeof createRequestSchema>
```

```ts
// schemas/activities/update.ts
import { z } from 'zod'
import { createActivitySchema } from './mutation'

export const validatedUUIDSchema = z.object({ uuid: z.string().uuid() })

export const updateDataSchema = createActivitySchema(() => '')
  .partial()
  .superRefine((value, ctx) => {
    if (!Object.values(value).some((v) => v !== undefined)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'At least one field required' })
    }
  })

export const updateRequestSchema = validatedUUIDSchema.extend({ data: updateDataSchema })
```

```ts
// schemas/activities/inits.ts
import { toDateTimeLocalValue } from '#/utils/form-utils'
import type { ActivityFormValues } from './mutation'
import type { ActivityRow } from './row'

export const defaultValues: ActivityFormValues = {
  title: '',
  owner: '',
  channel: 'email',
  status: 'open',
  urgent: false,
  notes: '',
  followUpAt: toDateTimeLocalValue(new Date().toISOString()),
}

export function createInitialValues(record?: ActivityRow): ActivityFormValues {
  if (!record) return { ...defaultValues }
  return {
    title: record.title,
    owner: record.owner,
    channel: record.channel as ActivityFormValues['channel'],
    status: record.status as ActivityFormValues['status'],
    urgent: record.urgent,
    notes: record.notes,
    followUpAt: toDateTimeLocalValue(record.followUpAt),
  }
}
```

### Updated Form View

```tsx
// views/forms/activity-form-page.tsx
import { useMemo } from 'react'
import { useRouter } from '@tanstack/react-router'
import { createActivitySchema } from '#/schemas/activities/mutation'
import { createInitialValues } from '#/schemas/activities/inits'
import { useAppForm } from '#/components/form'

type ActivityFormPageProps = {
  activityId?: string
  initialValues?: ActivityFormValues
  mode: 'create' | 'update'
}

async function handleActivitySubmit(
  value: ActivityFormValues,
  mode: 'create' | 'update',
  activityId: string | undefined,
  setPreview: Dispatch<SetStateAction<ActivityRecord | null>>,
  resetForm: (values: ActivityFormValues) => void,
) {
  const preview = createPreviewRecord(value, activityId)
  setPreview(preview)
  if (mode === 'update') {
    resetForm(value)
  }
  // Actual API call would go here, with error mapping:
  // const result = await (mode === 'create' ? createActivity(value) : updateActivity(activityId!, value))
  // if (result.error) return apiErrorToFormErrors(result.bucket, messages)
}

export default function ActivityFormPage({
  activityId,
  initialValues = defaultValues,
  mode,
}: ActivityFormPageProps) {
  const router = useRouter()
  const pageT = useTranslations('forms.page')
  const [preview, setPreview] = useState<ActivityRecord | null>(null)

  const schema = useMemo(() => createActivitySchema(pageT), [pageT])

  const form = useAppForm({
    defaultValues: createInitialValues(),
    validators: { onMount: schema, onChange: schema },
    onSubmit: async ({ value }) => {
      await handleActivitySubmit(value, mode, activityId, setPreview, form.reset)
    },
  })

  // ... render JSX (unchanged from current pattern)
}
```

---

## 6. Summary of Recommendations

| Decision | Verdict | Rationale |
|---|---|---|
| Keep `src/schemas/<domain>/create.ts` vs `update.ts` separation | ✅ Keep | More rigorous than boilerplate's single-schema approach |
| Keep `src/schemas/<domain>/inits.ts` pattern | ✅ Keep | Elegant createInitialValues(record?) dual-purpose |
| Keep `src/queries/server/` + `src/queries/client/` two-layer | ✅ Keep | Solid, matches boilerplate's architecture conceptually |
| Move schema factories from views to `src/schemas/<domain>/mutation.ts` | 🔄 Migrate | Centralizes validation, enables reuse |
| Extract submit handlers to module-level functions | 🔄 Migrate | Boilerplate O3 convention, enables testing |
| Add `apiErrorToFormErrors()` utility | ➕ Add | Maps `EntityClientResponse.bucket` → TanStack Form field errors |
| Wire `validators.onSubmitAsync` with error mapping | 🔄 Migrate | Boilerplate O6 convention |
| Response schemas in `row.ts` | ✅ Keep | Already done — excellent pattern |

**Total new files:** ~4 (activities domain schemas: mutation, create, update, inits, row)
**Total modified files:** ~6 (activity-form-page.tsx, lib/form.ts, components/form/FormInfo.tsx, plus other form views)
**No structural changes needed** to the existing architecture.
