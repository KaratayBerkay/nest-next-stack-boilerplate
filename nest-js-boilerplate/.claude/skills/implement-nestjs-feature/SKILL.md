---
description: Implement and verify a single NestJS documentation feature end-to-end — read the live docs page, build a real module, write a proof test, update the progress checklist, and log any docs discrepancy. Use when implementing or porting any feature from docs.nestjs.com.
---

# Implement a NestJS docs feature: $ARGUMENTS

Run the repo's verification protocol for the feature **"$ARGUMENTS"**.

1. **Locate** the feature's row in `docs/backend/progress/nestjs-feature-checklist.md`. Mark it 🔵 (in progress).
2. **Read the live docs** page for "$ARGUMENTS" at https://docs.nestjs.com/ — fetch it; don't
   rely on memory. Note the exact API and any version caveats.
3. **Implement** it as a real, self-contained module under `src/`, wired into the app where it
   belongs. Honor `CLAUDE.md` conventions (strict TS, one feature ≈ one module, no premature
   layering).
4. **Write a proof test** that exercises the *documented behavior* (e2e with `supertest` for
   HTTP, unit otherwise). The test — not compilation — is the proof.
5. **Run** the test + build; iterate until green.
6. **Update the checklist**: ✅ implemented → 🧪 verified, with the proof column pointing at
   the test or endpoint.
7. **If the docs example didn't work as written**, fix it and add a row to the *Docs issues
   log* in the checklist (docs claim vs. reality vs. fix).
8. **Report** concisely: module added, proof test, checklist row, and any docs discrepancy.

Keep the change scoped to this one feature.
