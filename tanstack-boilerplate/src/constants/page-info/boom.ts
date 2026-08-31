import type { PageInfoContent } from "@/types/ui/PageInfo-types";

export const boomPageInfo: PageInfoContent = {
  title: "Error Demo",
  description:
    "This page demonstrates the error boundary and error handling behavior.",
  sections: [
    {
      title: "Error Boundary",
      description:
        "This page intentionally triggers an error to show how the application handles unexpected failures.",
    },
    {
      title: "Recovery",
      description:
        "You can use the error boundary controls to try again or navigate back to a safe page.",
    },
  ],
};
