import { Alert, AlertTitle, AlertDescription } from "@/components/ui/Alert";

export function StatusAlertsSection() {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-lg font-semibold">Status Alerts</h3>
      <div className="flex flex-col gap-3">
        <Alert variant="success">
          <div className="flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <AlertTitle>Deployment Complete</AlertTitle>
          </div>
          <AlertDescription>
            Your application has been deployed to production successfully.
          </AlertDescription>
        </Alert>
        <Alert variant="warning">
          <div className="flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" x2="12" y1="9" y2="13" />
              <line x1="12" x2="12.01" y1="17" y2="17" />
            </svg>
            <AlertTitle>High Memory Usage</AlertTitle>
          </div>
          <AlertDescription>
            Server memory usage is at 87%. Consider scaling up.
          </AlertDescription>
        </Alert>
        <Alert variant="error">
          <div className="flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" x2="9" y1="9" y2="15" />
              <line x1="9" x2="15" y1="9" y2="15" />
            </svg>
            <AlertTitle>Build Failed</AlertTitle>
          </div>
          <AlertDescription>
            TypeScript compilation error in src/utils/parser.ts.
          </AlertDescription>
        </Alert>
      </div>
    </section>
  );
}
