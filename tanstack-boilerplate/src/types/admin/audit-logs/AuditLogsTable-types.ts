import type { I18nMessages } from "@/generated/i18n-messages";
import type { AuditLogEntry } from "@/types/admin/AuditLog-types";
import type { DateDisplayFormat } from "@/constants/date-display";

export interface AuditLogsTableProps {
  entries: AuditLogEntry[];
  total: number;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  t: I18nMessages["admin"];
  dateDisplay: DateDisplayFormat;
}
