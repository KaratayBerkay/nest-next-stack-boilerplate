import type { I18nMessages } from "@/generated/i18n-messages";
import type { AuditLogEntry } from "@/types/admin/AuditLog-types";

export interface AuditLogsDiffViewProps {
  entry: AuditLogEntry;
  t: I18nMessages["admin"];
}
