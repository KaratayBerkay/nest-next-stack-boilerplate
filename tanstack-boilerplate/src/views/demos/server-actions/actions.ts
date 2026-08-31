// Ported from next-js-boilerplate/src/app/(demos)/server-actions/actions.ts
// The "use server" action becomes a TanStack Start server function;
// `greetAction` keeps its (prev, formData) shape for useActionState.

import { createServerFn } from "@tanstack/react-start";

export interface ActionResult {
  greeting: string;
}

const greet = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error("Expected FormData");
    return data;
  })
  .handler(async ({ data }): Promise<ActionResult> => {
    const name = data.get("name") as string;
    // Simulate async work.
    await new Promise((r) => setTimeout(r, 100));
    return { greeting: `Hello, ${name}!` };
  });

export async function greetAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  return greet({ data: formData });
}
