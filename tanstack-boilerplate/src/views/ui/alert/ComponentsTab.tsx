import { Alert, AlertTitle, AlertDescription } from "@/components/ui/Alert";

export function ComponentsTab() {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Default</h3>
        <Alert variant="default">
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>
            You can add components to your app using the CLI.
          </AlertDescription>
        </Alert>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Info</h3>
        <Alert variant="info">
          <AlertTitle>Scheduled maintenance</AlertTitle>
          <AlertDescription>
            The service will be briefly unavailable on Sunday at 02:00 UTC.
          </AlertDescription>
        </Alert>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Success</h3>
        <Alert variant="success">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>
            Your changes have been saved successfully.
          </AlertDescription>
        </Alert>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Warning</h3>
        <Alert variant="warning">
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            Your subscription will expire in 7 days.
          </AlertDescription>
        </Alert>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Error</h3>
        <Alert variant="error">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Your session has expired. Please log in again.
          </AlertDescription>
        </Alert>
      </section>
    </div>
  );
}
