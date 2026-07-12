import type { PageInfoContent } from "@/types/ui/PageInfo-types";

export const adminAuditLogsPageInfo: PageInfoContent = {
  title: "Audit Logs",
  description: "Track and review all administrative actions and system events.",
  sections: [
    {
      title: "Log Entries",
      description:
        "View a chronological list of all audit events, including who performed the action and when.",
    },
    {
      title: "Filtering",
      description:
        "Filter logs by event type, user, or date range to find specific activities.",
    },
    {
      title: "Event Types",
      description:
        "Logs include user creation, tier changes, login events, and other administrative actions.",
    },
  ],
};
