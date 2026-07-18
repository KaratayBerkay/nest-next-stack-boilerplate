import { useState } from "react";
import { Combobox } from "@/components/ui/Combobox";
import { getLabel } from "./helpers";
import { assignees } from "./data";

export function ComponentsTab() {
  const [assignee, setAssignee] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Assignee</h3>
        <Combobox
          options={assignees}
          value={assignee}
          onValueChange={setAssignee}
          placeholder="Select assignee..."
          searchPlaceholder="Search teammates..."
          className="max-w-sm"
        />
        {assignee && (
          <div className="bg-surface flex items-center justify-between rounded border border-border px-3 py-2">
            <span className="text-sm">
              Assigned to: <strong>{getLabel(assignee, assignees)}</strong>
            </span>
            <button
              type="button"
              onClick={() => setAssignee("")}
              className="text-muted hover:text-fg p-0.5"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
