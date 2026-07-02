"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { greetAction } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-brand rounded px-3 py-1 text-xs text-white disabled:opacity-50"
      data-testid="submit-btn"
    >
      {pending ? "Sending..." : "Greet me"}
    </button>
  );
}

export default function GreetingForm() {
  const [state, formAction, isPending] = useActionState(greetAction, null);

  return (
    <div className="flex flex-col gap-3">
      <form action={formAction} className="flex items-end gap-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-xs text-zinc-500">
            Your name
          </label>
          <input
            id="name"
            name="name"
            required
            className="rounded border px-2 py-1 text-sm"
            data-testid="name-input"
          />
        </div>
        <SubmitButton />
      </form>
      {isPending && (
        <p className="text-xs text-zinc-400" data-testid="pending">
          Submitting...
        </p>
      )}
      {state?.greeting && !isPending && (
        <p className="text-sm font-semibold" data-testid="greeting">
          {state.greeting}
        </p>
      )}
    </div>
  );
}
