"use client";

import { IconSearch } from "@tabler/icons-react";
import { Input } from "@/components/ui/Input";
import type { AuditLogsFiltersProps } from "@/types/admin/audit-logs/AuditLogsFilters-types";

export function AuditLogsFilters({
  actionFilter,
  setActionFilter,
  levelFilter,
  setLevelFilter,
  entityFilter,
  setEntityFilter,
  setPage,
  t,
}: AuditLogsFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={actionFilter}
        onChange={(e) => {
          setActionFilter(e.target.value);
          setPage(0);
        }}
        className="border-border bg-surface text-fg rounded-lg border px-2 py-1.5 text-xs"
      >
        <option value="">{t.allActions}</option>
        <option value="CREATE">Create</option>
        <option value="UPDATE">Update</option>
        <option value="DELETE">Delete</option>
        <option value="LOGIN">Login</option>
        <option value="LOGOUT">Logout</option>
        <option value="LOGIN_FAILED">Login Failed</option>
        <option value="SIGNUP">Signup</option>
        <option value="EMAIL_VERIFIED">Email Verified</option>
        <option value="PASSWORD_CHANGED">Password Changed</option>
        <option value="MFA_ENABLED">MFA Enabled</option>
        <option value="MFA_DISABLED">MFA Disabled</option>
        <option value="ROLE_CHANGED">Role Changed</option>
        <option value="PERMISSION_GRANTED">Permission Granted</option>
        <option value="PERMISSION_REVOKED">Permission Revoked</option>
        <option value="EXPORT">Export</option>
        <option value="IMPORT">Import</option>
        <option value="API_KEY_CREATED">API Key Created</option>
        <option value="API_KEY_REVOKED">API Key Revoked</option>
      </select>

      <select
        value={levelFilter}
        onChange={(e) => {
          setLevelFilter(e.target.value);
          setPage(0);
        }}
        className="border-border bg-surface text-fg rounded-lg border px-2 py-1.5 text-xs"
      >
        <option value="">{t.allLevels}</option>
        <option value="TRACE">TRACE</option>
        <option value="DEBUG">DEBUG</option>
        <option value="INFO">INFO</option>
        <option value="WARN">WARN</option>
        <option value="ERROR">ERROR</option>
        <option value="FATAL">FATAL</option>
      </select>

      <div className="relative">
        <IconSearch
          size={14}
          stroke={1.5}
          className="text-muted pointer-events-none absolute top-1/2 left-2 z-10 -translate-y-1/2"
        />
        <Input
          type="text"
          value={entityFilter}
          onChange={(e) => {
            setEntityFilter(e.target.value);
            setPage(0);
          }}
          placeholder={t.entityType}
          className="w-40 pl-7 text-xs"
        />
      </div>
    </div>
  );
}
