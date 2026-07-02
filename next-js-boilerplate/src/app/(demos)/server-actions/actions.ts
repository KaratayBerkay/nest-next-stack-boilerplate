"use server";

export interface ActionResult {
  greeting: string;
}

export async function greetAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const name = formData.get("name") as string;
  // Simulate async work.
  await new Promise((r) => setTimeout(r, 100));
  return { greeting: `Hello, ${name}!` };
}
