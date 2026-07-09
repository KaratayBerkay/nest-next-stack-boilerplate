import type { Metadata } from "next";
import { Suspense } from "react";
import { SignupForm } from "./Form";

export const metadata: Metadata = {
  title: "Form",
  description: "Form handling demo",
};

export default function FormPage() {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-brand text-sm font-semibold">
        TanStack Form &mdash; Signup Demo
      </h2>
      <p className="text-muted text-sm">
        This form uses <code className="text-brand">@tanstack/react-form</code>{" "}
        with Zod v4 validation. Client-side validation fires on change;
        server-side validation runs on submit.
      </p>
      <Suspense fallback={null}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
