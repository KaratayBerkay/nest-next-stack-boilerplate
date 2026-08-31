import type { I18nMessages } from "@/generated/i18n-messages";

export interface AuditLogsFiltersProps {
  actionFilter: string;
  setActionFilter: (value: string) => void;
  levelFilter: string;
  setLevelFilter: (value: string) => void;
  entityFilter: string;
  setEntityFilter: (value: string) => void;
  setPage: (value: number) => void;
  t: I18nMessages["admin"];
}
