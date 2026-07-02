# Zod v4 — TypeScript-first schema validation

## Version

`zod@^4.0.0` (stable as of 2026)

## Installation

```bash
pnpm add zod@^4.0.0
```

## Import

```ts
import { z } from "zod";
```

## Zod v3 → v4 Migration

| v3                                      | v4                                                  |
| --------------------------------------- | --------------------------------------------------- |
| `z.string()`                            | `z.string()` (same)                                 |
| `z.object({})`                          | `z.object({})` (same)                               |
| `.email()`                              | `z.email()` (preferred) or `.email()` (deprecated)  |
| `z.string().refine(...).min(5)`         | chaining now works: `z.string().refine(...).min(5)` |
| `invalid_type_error` / `required_error` | `{ error: (issue) => string }`                      |
| `errorMap`                              | `{ error: (issue) => string }`                      |
| `.describe()`                           | `.meta()` preferred, `.describe()` still works      |
| `z.lazy(() => ...)` for recursive types | `get field(){ return ... }` getter syntax           |

---

## 1. Schema Types

### 1.1 Primitives

```ts
z.string(); // string
z.number(); // number
z.boolean(); // boolean
z.bigint(); // bigint
z.symbol(); // symbol
z.undefined(); // undefined
z.null(); // null
z.any(); // any (disable type checking)
z.unknown(); // unknown
z.never(); // never
z.void(); // undefined (accepts)
z.nan(); // NaN
```

### 1.2 String formats (top-level — new in v4)

```ts
z.email(); // email validation
z.url(); // URL validation
z.uuid(); // UUID (v4)
z.uuidv4(); // UUID v4
z.uuidv7(); // UUID v7
z.ipv4(); // IPv4
z.ipv6(); // IPv6
z.cidrv4(); // CIDR v4
z.cidrv6(); // CIDR v6
z.base64(); // base64
z.base64url(); // base64 URL-safe
z.jwt(); // JWT
z.e164(); // E.164 phone
z.emoji(); // emoji string
z.nanoid(); // nanoid
z.cuid(); // cuid
z.cuid2(); // cuid2
z.ulid(); // ULID
z.lowercase(); // lowercase string
z.hex(); // hex string
z.hostname(); // hostname
z.hash(); // hash string
```

### 1.3 Number formats (new in v4)

```ts
z.int(); // safe integer
z.float32(); // 32-bit float
z.float64(); // 64-bit float
z.int32(); // 32-bit signed int
z.int64(); // 64-bit signed int (bigint)
z.uint32(); // 32-bit unsigned int
z.uint64(); // 64-bit unsigned int (bigint)
```

### 1.4 Stringbool (new in v4)

```ts
z.stringbool(); // parses "true"/"1"/"yes"/"on"/"y" → true
z.stringbool({ truthy: ["yes"], falsy: ["no"] });
```

### 1.5 File (new in v4)

```ts
z.file();
z.file().min(10_000); // minimum bytes
z.file().max(1_000_000); // maximum bytes
z.file().mime(["image/png"]); // MIME type validation
```

### 1.6 Object

```ts
z.object({ name: z.string(), age: z.number() });
z.object({ name: z.string() }).strictObject({ name: z.string() }); // no extra keys
z.object({ name: z.string() }).looseObject({ name: z.string() }); // allow extra keys

// Methods
schema.shape; // access shape
schema.keyof(); // "name" | "age"
schema.extend({ extra: z.string() });
schema.pick({ name: true });
schema.omit({ age: true });
schema.partial(); // all optional
schema.required(); // all required
schema.deepPartial(); // deep partial (new)
schema.nonstrict(); // allow unknown keys
schema.pick({ name: true }).extend({ email: z.string() });
```

### 1.7 Array

```ts
z.array(z.string());
z.array(z.number()).min(1);
z.array(z.number()).max(10);
z.array(z.number()).length(3);
z.array(z.number()).nonempty(); // at least 1 element
schema.element; // access element schema
```

### 1.8 Tuple

```ts
z.tuple([z.string(), z.number()]);
// length fixed, each position typed
```

### 1.9 Union & Discriminated Union

```ts
z.union([z.string(), z.number()]);
z.discriminatedUnion("status", [
  z.object({ status: z.literal("success"), data: z.string() }),
  z.object({ status: z.literal("fail"), error: z.string() }),
]);
// Discriminated unions compose (new in v4)
```

### 1.10 Literal

```ts
z.literal("hello");
z.literal(42);
z.literal(true);
z.literal(["a", "b", "c"]); // multiple values (new in v4)
```

### 1.11 Enum

```ts
z.enum(["A", "B", "C"]); // string enum
z.nativeEnum(Direction); // TypeScript enum
```

### 1.12 Record

```ts
z.record(z.string()); // { [key: string]: string }
z.record(z.number(), z.string()); // { [key: number]: string }
z.partialRecord(z.string(), z.number()); // optional keys (new)
```

### 1.13 Date

```ts
z.date();
z.date().min(new Date("2020-01-01"));
z.date().max(new Date("2030-01-01"));
```

### 1.14 Map / Set

```ts
z.map(z.string(), z.number()); // Map<string, number>
z.set(z.string()); // Set<string>
```

### 1.15 Promise

```ts
z.promise(z.string()); // Promise<string>
```

### 1.16 Template Literal (new in v4)

```ts
z.templateLiteral(["hello, ", z.string()]);
// `hello, ${string}`
z.templateLiteral([z.number(), z.enum(["px", "em"])]);
// `${number}px` | `${number}em`
```

### 1.17 Recursive Types (new in v4 — getter syntax)

```ts
const Category = z.object({
  name: z.string(),
  get subcategories() {
    return z.array(Category);
  },
});
type Category = z.infer<typeof Category>;
// { name: string; subcategories: Category[] }
```

---

## 2. Validation Methods

### 2.1 String constraints

```ts
z.string().min(1); // min length
z.string().max(100); // max length
z.string().length(5); // exact length
z.string().email(); // email (deprecated, use z.email())
z.string().url(); // URL
z.string().uuid(); // UUID
z.string().includes("foo"); // substring
z.string().startsWith("https"); // prefix
z.string().endsWith(".com"); // suffix
z.string().regex(/^[A-Z]/); // regex
z.string().trim(); // trim whitespace
z.string().toLowerCase(); // lowercase transform
z.string().toUpperCase(); // uppercase transform
z.string().slugify(); // slug transform (new)
z.string().normalize(); // unicode normalize (new)
```

### 2.2 Number constraints

```ts
z.number().min(0); // >= 0
z.number().max(100); // <= 100
z.number().lt(100); // < 100 (new top-level: z.lt())
z.number().gt(0); // > 0 (new top-level: z.gt())
z.number().lte(100); // <= 100
z.number().gte(0); // >= 0
z.number().int(); // integer
z.number().positive(); // > 0
z.number().negative(); // < 0
z.number().nonpositive(); // <= 0
z.number().nonnegative(); // >= 0
z.number().multipleOf(5); // divisible by 5
z.number().finite(); // not Infinity/NaN
z.number().safe(); // safe integer range
```

### 2.3 Array constraints

```ts
z.array(z.string()).min(1); // at least 1
z.array(z.string()).max(10); // at most 10
z.array(z.string()).length(3); // exactly 3
z.array(z.string()).nonempty(); // at least 1 (alias)
```

### 2.4 Date constraints

```ts
z.date().min(new Date("2020-01-01"));
z.date().max(new Date("2030-01-01"));
```

### 2.5 File constraints (new in v4)

```ts
z.file().min(10_000); // min bytes
z.file().max(1_000_000); // max bytes
z.file().mime(["image/png", "image/jpeg"]); // MIME types
```

### 2.6 Size constraints (new in v4 top-level)

```ts
z.minSize(5); // min array/set/map size
z.maxSize(10); // max array/set/map size
z.size(3); // exact size
```

---

## 3. Custom Validation (refine)

### 3.1 Basic refine

```ts
const schema = z.string().refine((val) => val.length > 3, {
  message: "Must be more than 3 characters",
});
```

### 3.2 Refine with custom error (v4 syntax)

```ts
z.string().refine((val) => val.includes("@"), {
  error: "Must contain @",
});
```

### 3.3 Async refine

```ts
z.string().refine(
  async (val) => {
    const exists = await checkUsername(val);
    return !exists;
  },
  { message: "Username taken" },
);
```

### 3.4 superRefine (multiple errors)

```ts
z.string().superRefine((val, ctx) => {
  if (val.length < 3) {
    ctx.addIssue({ code: "too_small", minimum: 3, message: "Too short" });
  }
  if (!val.includes("@")) {
    ctx.addIssue({ code: "invalid_format", message: "Must contain @" });
  }
});
```

### 3.5 Refinements now chain with methods (new in v4)

```ts
z.string()
  .refine((val) => val.includes("@"))
  .min(5); // ✅ works in v4
// In v3: ❌ Property 'min' does not exist on type ZodEffects
```

---

## 4. Transformations

### 4.1 Basic transform

```ts
z.string().transform((val) => val.length);
// input: string, output: number
z.string().transform((val) => parseInt(val));
z.number().transform((val) => val.toString());
```

### 4.2 Pipe (transform chain)

```ts
z.string()
  .transform((val) => val.trim())
  .pipe(z.string().min(1));
// trim then validate min length
```

### 4.3 overwrite (new in v4 — transform without changing type)

```ts
z.string().overwrite((val) => val.trim());
z.number().overwrite((val) => Math.round(val));
// Type stays string/number — unlike transform which can change type
```

### 4.4 Built-in overwrite methods

```ts
z.string().trim(); // trim whitespace
z.string().toLowerCase(); // lowercase
z.string().toUpperCase(); // uppercase
z.string().normalize(); // unicode normalize
z.string().slugify(); // slug format
```

### 4.5 Default values

```ts
z.string().default("hello");
z.number().default(0);
z.array(z.string()).default([]);
```

### 4.6 Catch (replace invalid with default)

```ts
z.string().catch("fallback");
z.number().catch(0);
// Instead of throwing, returns the catch value on invalid input
```

---

## 5. Preprocess / Coerce

### 5.1 Preprocess

```ts
z.preprocess((val) => String(val), z.string().min(1));
// Runs before validation
```

### 5.2 Coerce

```ts
z.coerce.string(); // coerces input to string
z.coerce.number(); // coerces to number
z.coerce.boolean(); // coerces to boolean
z.coerce.bigint(); // coerces to bigint
z.coerce.date(); // coerces to Date

// Examples:
z.coerce.number().parse("42"); // → 42
z.coerce.boolean().parse("true"); // → true (v3 behavior)
```

### 5.3 Stringbool (new in v4 — more sophisticated coercion)

```ts
z.stringbool(); // "true"/"1"/"yes" → true
z.stringbool().parse("true"); // → true
z.stringbool().parse("yes"); // → true
z.stringbool().parse("false"); // → false
z.stringbool().parse("0"); // → false
```

---

## 6. Optional / Nullable

```ts
z.string().optional(); // string | undefined
z.string().nullable(); // string | null
z.string().nullish(); // string | null | undefined
z.nullable(z.string()); // same as .nullable()
z.optional(z.string()); // same as .optional()
z.exactOptional(z.string()); // exact optional (new)
z.nonoptional(z.string()); // remove optional (new)
z.prefault(z.string(), "default"); // default value (new)
```

---

## 7. Modifiers

### 7.1 readonly

```ts
z.string().readonly(); // output type is readonly string
z.object({ name: z.string() }).readonly();
```

### 7.2 Brand

```ts
const Email = z.string().brand<"Email">();
type Email = z.infer<typeof Email>; // string & { __brand: "Email" }
```

### 7.3 Pipe

```ts
z.string().pipe(z.number()); // input string, output number
```

---

## 8. Parsing Methods

```ts
schema.parse(data); // throws ZodError on failure
schema.safeParse(data); // { success: boolean, data?: T, error?: ZodError }
await schema.parseAsync(data); // async variant
await schema.safeParseAsync(data); // async safe variant
schema.encode(data); // encoding (new)
schema.decode(data); // decoding (new)
```

### 8.1 Type inference

```ts
type T = z.infer<typeof schema>; // input/output type
type I = z.input<typeof schema>; // input type only
type O = z.output<typeof schema>; // output type only
```

---

## 9. JSON Schema (new in v4)

```ts
import { z } from "zod";
const schema = z.object({
  name: z.string().meta({ title: "User name" }),
  age: z.number().meta({ examples: [25] }),
});
z.toJSONSchema(schema);
// => { type: "object", properties: { name: { type: "string", title: "User name" }, ... } }
```

## 10. Metadata (new in v4)

```ts
z.string().meta({
  title: "Email",
  description: "User email",
  examples: ["a@b.com"],
});
z.globalRegistry.add(z.string(), { id: "email" });
const meta = z.globalRegistry.get(z.string()); // retrieve metadata
```

## 11. Error Handling

### 11.1 Custom error messages (v4 syntax)

```ts
z.string({ error: "Must be a string" });
z.string().min(1, { error: "Too short" });
z.number().int({ error: "Must be integer" });

// Function syntax for dynamic messages
z.string({
  error: (issue) =>
    issue.code === "too_small"
      ? `Must be at least ${issue.minimum} characters`
      : undefined,
});
```

### 11.2 Error formatting

```ts
z.prettifyError(error); // pretty-print to multi-line string
z.formatError(error); // structured format
z.flattenError(error); // flatten to field-level messages
```

### 11.3 Error codes

```ts
z.ZodError; // error class
z.ZodIssueCode; // "invalid_type" | "too_small" | "custom" | ...
error.issues; // array of issue objects
issue.code; // error code
issue.path; // path to field
issue.message; // error message
```

---

## 12. Standard Schema (integrations)

Zod v4 implements the Standard Schema spec via `schema["~standard"]`.

```ts
const schema = z.object({ name: z.string().min(1) });
const std = schema["~standard"];
// validates: { value: T } | { issues: [...] }
const result = std.validate({ name: "test" });
```

This is what TanStack Form v1 uses internally — no adapter needed.

---

## 13. Common Patterns

### 13.1 Signup form schema

```ts
const signupSchema = z
  .object({
    name: z.string().min(1, { error: "Name is required" }),
    email: z.string().email({ error: "Invalid email" }),
    age: z.number().min(18, { error: "Must be 18+" }),
    password: z.string().min(8, { error: "Min 8 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
  });
```

### 13.2 Update profile schema (partial)

```ts
const updateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  avatar: z.file().max(5_000_000).mime(["image/*"]).optional(),
});
```

### 13.3 PATCH with preprocess

```ts
const patchSchema = z.preprocess(
  (data) => {
    // Strip undefined fields for partial updates
    if (typeof data === "object" && data !== null) {
      return Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined),
      );
    }
    return data;
  },
  z.object({
    name: z.string().min(1).optional(),
    email: z.email().optional(),
  }),
);
```

### 13.4 Query params parsing

```ts
const querySchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sort: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().optional(),
});
// querySchema.parse({ page: "2", limit: "50" })
// → { page: 2, limit: 50, sort: "desc", search: undefined }
```

### 13.5 Environment variables

```ts
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.coerce.number().default(3000),
  API_KEY: z.string().min(1),
});
// Validate at startup:
// const env = envSchema.parse(process.env)
```

---

## 14. Performance Notes (v4 vs v3)

- String parsing: **14x faster**
- Array parsing: **7x faster**
- Object parsing: **6.5x faster**
- `tsc` instantiations: **100x reduction**
- Core bundle: **57% smaller** (12.47kb → 5.36kb gzip)
- Zod Mini: **85% smaller** (→ 1.88kb gzip)

---

## 15. Integration with TanStack Form

```tsx
import { z } from "zod";
import { useForm } from "@tanstack/react-form";

const schema = z.object({
  name: z.string().min(1, { error: "Name is required" }),
  email: z.string().email({ error: "Invalid email" }),
  age: z.number().min(18, { error: "Must be 18+" }),
});

function MyForm() {
  const form = useForm({
    defaultValues: { name: "", email: "", age: 0 },
    validators: { onChange: schema, onBlur: schema }, // Standard Schema
  });
  // ...
}
```

---

## 16. Cheatsheet

| Goal                | Code                                           |
| ------------------- | ---------------------------------------------- |
| Required string     | `z.string().min(1)`                            |
| Optional string     | `z.string().optional()`                        |
| Email               | `z.email()`                                    |
| URL                 | `z.url()`                                      |
| Number 0–100        | `z.number().min(0).max(100)`                   |
| Positive integer    | `z.number().int().positive()`                  |
| Array of strings    | `z.array(z.string())`                          |
| Exact length array  | `z.array(z.string()).length(3)`                |
| Union               | `z.union([A, B])`                              |
| Discriminated union | `z.discriminatedUnion("k", [...])`             |
| Transform           | `z.string().transform(v => v.length)`          |
| Pipe                | `a.pipe(b)`                                    |
| Preprocess          | `z.preprocess(fn, schema)`                     |
| Default             | `z.string().default("x")`                      |
| Catch fallback      | `z.string().catch("fallback")`                 |
| Refine              | `z.string().refine(v => v.length > 3)`         |
| Async refine        | `z.string().refine(async v => await check(v))` |
| Partial object      | `schema.partial()`                             |
| Pick fields         | `schema.pick({ a: true })`                     |
| Safe parse          | `schema.safeParse(data)`                       |
| Type inference      | `z.infer<typeof schema>`                       |
