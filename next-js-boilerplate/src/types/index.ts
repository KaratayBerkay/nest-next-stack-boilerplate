// App-wide shared types. Keep framework/UI types out of here.

export type Nullable<T> = T | null;

/** Shape returned by the BFF for an authenticated session. */
export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
};

/** Next.js page params with a single `lang` segment. */
export type LangParams = { lang: string };

/** Next.js page params with a single `id` segment. */
export type IdParams = { id: string };

/** Next.js page params with a single `slug` segment. */
export type SlugParams = { slug: string };

/** Next.js page params with `lang` + `uuid` segments. */
export type LangUuidParams = { lang: string; uuid: string };

/** Catch-all `[...path]` params. */
export type CatchAllParams = { path: string[] };

/** Next.js route handler / page that accepts async params. */
export type WithParams<T> = { params: Promise<T> };
