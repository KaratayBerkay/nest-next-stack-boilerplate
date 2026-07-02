import { Suspense } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/Alert";

async function Content() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Alert</h2>
      <p className="text-muted text-sm">
        Displays a callout for user attention.
      </p>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Default</h3>
        <Alert variant="default" data-testid="alert-default">
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>
            You can add components to your app using the CLI.
          </AlertDescription>
        </Alert>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Destructive</h3>
        <Alert variant="destructive" data-testid="alert-destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Your session has expired. Please log in again.
          </AlertDescription>
        </Alert>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Success</h3>
        <Alert variant="success" data-testid="alert-success">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>
            Your changes have been saved successfully.
          </AlertDescription>
        </Alert>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Warning</h3>
        <Alert variant="warning" data-testid="alert-warning">
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            Your subscription will expire in 7 days.
          </AlertDescription>
        </Alert>
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
