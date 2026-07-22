"use client";

const ROLE_OPTIONS = [
  { value: "member", label: "Member" },
  { value: "admin", label: "Admin" },
  { value: "owner", label: "Owner" },
];

interface ReviewStepProps {
  emails: string[];
  role: string;
  message: string;
  t: Record<string, unknown>;
}

export function ReviewStep({ emails, role, message, t }: ReviewStepProps) {
  return (
    <div className="surface border-border flex flex-col gap-2 rounded-lg border p-4">
      <p className="text-xs font-semibold">{t.stepReview as string}</p>
      <div className="flex flex-col gap-1 text-xs">
        <span>
          {t.emails as string}: {emails.join(", ")}
        </span>
        <span>
          {t.role as string}:{" "}
          {ROLE_OPTIONS.find((r) => r.value === role)?.label ?? role}
        </span>
        {message && (
          <span>
            {t.message as string}: {message}
          </span>
        )}
      </div>
    </div>
  );
}
