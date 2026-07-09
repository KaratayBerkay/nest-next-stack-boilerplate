import type { Metadata } from "next";
import GreetingForm from "./GreetingForm";

export const metadata: Metadata = {
  title: "Server Actions",
  description: "Server actions demo",
};

export default function ServerActionsPage() {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-brand text-sm font-semibold">Server Actions</h2>
      <p className="text-muted text-sm">
        This form submits to a Server Action. The action processes the data and
        returns a result without a manual API route.
      </p>
      <GreetingForm />
    </div>
  );
}
