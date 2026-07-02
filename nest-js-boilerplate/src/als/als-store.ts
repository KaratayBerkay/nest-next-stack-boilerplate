/**
 * Async Local Storage (#118) — the per-request store shape.
 *
 * Typing the {@link AsyncLocalStorage} generic with this interface is what gives the docs'
 * untyped `getStore()['userId']` access strict-mode safety: reads are checked against this
 * contract rather than `any`. Keep it small — the docs warn against contextual "God objects".
 */
export interface AlsStore {
  /** Caller identity, lifted from the `x-user-id` request header by the ALS middleware. */
  userId: string;
}
