"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { greetAction } from "@/app/(demos)/server-actions/actions";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      variant="primary"
      size="sm"
      data-testid="submit-btn"
    >
      {pending ? "Sending..." : "Greet me"}
    </Button>
  );
}

export default function GreetingForm() {
  const [state, formAction, isPending] = useActionState(greetAction, null);

  return (
    <div className="flex flex-col gap-3">
      <form action={formAction} className="flex items-end gap-2">
        <div className="flex flex-col gap-1">
          <Label htmlFor="name">Your name</Label>
          <Input
            id="name"
            name="name"
            required
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
