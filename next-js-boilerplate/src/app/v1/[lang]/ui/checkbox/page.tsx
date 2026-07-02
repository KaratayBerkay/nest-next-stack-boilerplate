import { Suspense } from "react";
import { Checkbox } from "@/components/ui/Checkbox";

async function Content() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Checkbox</h2>
      <p className="text-muted text-sm">
        A control that allows the user to toggle between checked and unchecked
        states.
      </p>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Default</h3>
        <Checkbox data-testid="checkbox-default" />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Checked</h3>
        <Checkbox defaultChecked data-testid="checkbox-checked" />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Disabled</h3>
        <div className="flex flex-col gap-2">
          <Checkbox disabled data-testid="checkbox-disabled" />
          <Checkbox
            disabled
            defaultChecked
            data-testid="checkbox-disabled-checked"
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">With Label</h3>
        <div className="flex flex-col gap-2">
          <Checkbox
            label="Accept terms and conditions"
            data-testid="checkbox-with-label"
          />
          <Checkbox
            label="Disabled option"
            disabled
            data-testid="checkbox-disabled-label"
          />
        </div>
      </section>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">Loading...</p>}>
      <Content />
    </Suspense>
  );
}
