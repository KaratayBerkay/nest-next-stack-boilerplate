# React Compiler Verdict

**Status:** Enabled (v19)

React Compiler is enabled in `next.config.ts` via `reactCompiler: true`.

## NF-1 — `form.state` subscriptions

Reads of `form.state` (from `react-dom`) must go through a subscribed reference (e.g. `useStore(form)`). If the compiler sees a bare `form.state` read, it may freeze the value at the last known render, causing stale reads in event handlers and effects.

**Verdict:** NF-1 is fixed — all `form.state` reads in the codebase now go through a store subscription.

## Build-time observations

No bailouts observed in the forms views. The compiler successfully optimises all component functions in the views layer without falling back to the runtime interpreter.

## Hand-written memoisation

The compiler can prove most hand-written `useMemo` and `useCallback` calls redundant. These are kept as-is for:

- Code clarity — explicit dependencies document intent
- Defensive safety — guarding against future changes that might introduce new dependencies
- Consistency with team conventions

No large-scale removal was performed. Existing memoisation is harmless and may help human readers.
