"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { FormLevelError } from "@/components/ui/FormLevelError";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/ui/PageContent-types";

function FormLevelErrorDemo() {
  const [submitted, setSubmitted] = useState(false);

  const form = useForm({
    defaultValues: { email: "" },
    onSubmit: async ({ value }) => {
      if (!value.email.includes("@")) {
        throw new Error("Please enter a valid email address.");
      }
      setSubmitted(true);
    },
  });

  return (
    <div className="flex max-w-sm flex-col gap-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <div className="flex flex-col gap-3">
          <FormLevelError form={form} />
          <form.Field name="email">
            {(field) => (
              <Input
                placeholder="Email"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>
          <Button type="submit">Submit</Button>
          {submitted && (
            <p className="text-success text-sm">Submitted successfully!</p>
          )}
        </div>
      </form>
    </div>
  );
}

function StaticErrorDemo() {
  return (
    <div className="flex max-w-sm flex-col gap-4">
      <p className="text-muted text-sm">
        The FormLevelError component requires a TanStack Form instance. See the
        &quot;Interactive&quot; tab for a live example.
      </p>
    </div>
  );
}

const examples: UIExample[] = [
  {
    id: "static",
    title: "Overview",
    description: "How FormLevelError works with TanStack Form.",
    render: () => <StaticErrorDemo />,
  },
  {
    id: "interactive",
    title: "Interactive",
    description: "Submit with an invalid email to see the error banner.",
    render: () => <FormLevelErrorDemo />,
  },
];

export default function FormLevelErrorPage({ initialTab }: InitialTabProps) {
  return (
    <ExampleTabs
      title="Form Level Error"
      intro="Error message displayed at the form level using TanStack Form."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
