export interface MessageTickProps {
  status: "sent" | "delivered" | "read" | "failed";
  failedLabel?: string;
}
