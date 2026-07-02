import { Suspense } from "react";
import { Button } from "@/components/ui/Button";

async function Content() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Button</h2>
      <p className="text-muted text-sm">
        Displays a button or a component that looks like a button.
      </p>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Variants</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="default" data-testid="button-default">
            Default
          </Button>
          <Button variant="primary" data-testid="button-primary">
            Primary
          </Button>
          <Button variant="secondary" data-testid="button-secondary">
            Secondary
          </Button>
          <Button variant="outline" data-testid="button-outline">
            Outline
          </Button>
          <Button variant="ghost" data-testid="button-ghost">
            Ghost
          </Button>
          <Button variant="destructive" data-testid="button-destructive">
            Destructive
          </Button>
          <Button variant="link" data-testid="button-link">
            Link
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Sizes</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="xs" data-testid="button-xs">
            Extra Small
          </Button>
          <Button size="sm" data-testid="button-sm">
            Small
          </Button>
          <Button size="md" data-testid="button-md">
            Medium
          </Button>
          <Button size="lg" data-testid="button-lg">
            Large
          </Button>
          <Button size="icon" data-testid="button-icon" aria-label="Search">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </Button>
          <Button size="icon-sm" data-testid="button-icon-sm" aria-label="Menu">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </Button>
          <Button size="icon-xs" data-testid="button-icon-xs" aria-label="X">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Disabled</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button disabled data-testid="button-disabled-default">
            Default
          </Button>
          <Button
            variant="primary"
            disabled
            data-testid="button-disabled-primary"
          >
            Primary
          </Button>
          <Button
            variant="outline"
            disabled
            data-testid="button-disabled-outline"
          >
            Outline
          </Button>
          <Button
            variant="destructive"
            disabled
            data-testid="button-disabled-destructive"
          >
            Destructive
          </Button>
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
