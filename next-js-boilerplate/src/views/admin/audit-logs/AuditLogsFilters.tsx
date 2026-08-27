"use client";

import { IconSearch } from "@tabler/icons-react";
import { Input } from "@/components/ui/Input";
import { NativeSelect } from "@/components/ui/NativeSelect";
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
      <NativeSelect
        value={actionFilter}
        onChange={(e) => {
          setActionFilter(e.target.value);
          setPage(0);
        }}
        className="text-xs"
      >
        <option value="">{t.allActions}</option>
        <option value="CREATE">{t.actionCreate}</option>
        <option value="UPDATE">{t.actionUpdate}</option>
        <option value="DELETE">{t.actionDelete}</option>
        <option value="LOGIN">{t.actionLogin}</option>
        <option value="LOGOUT">{t.actionLogout}</option>
        <option value="LOGIN_FAILED">{t.actionLoginFailed}</option>
        <option value="SIGNUP">{t.actionSignup}</option>
        <option value="EMAIL_VERIFIED">{t.actionEmailVerified}</option>
        <option value="PASSWORD_CHANGED">{t.actionPasswordChanged}</option>
        <option value="MFA_ENABLED">{t.actionMfaEnabled}</option>
        <option value="MFA_DISABLED">{t.actionMfaDisabled}</option>
        <option value="ROLE_CHANGED">{t.actionRoleChanged}</option>
        <option value="PERMISSION_GRANTED">{t.actionPermissionGranted}</option>
        <option value="PERMISSION_REVOKED">{t.actionPermissionRevoked}</option>
        <option value="EXPORT">{t.actionExport}</option>
        <option value="IMPORT">{t.actionImport}</option>
        <option value="API_KEY_CREATED">{t.actionApiKeyCreated}</option>
        <option value="API_KEY_REVOKED">{t.actionApiKeyRevoked}</option>
      </NativeSelect>

      <NativeSelect
        value={levelFilter}
        onChange={(e) => {
          setLevelFilter(e.target.value);
          setPage(0);
        }}
        className="text-xs"
      >
        <option value="">{t.allLevels}</option>
        <option value="TRACE">TRACE</option>
        <option value="DEBUG">DEBUG</option>
        <option value="INFO">INFO</option>
        <option value="WARN">WARN</option>
        <option value="ERROR">ERROR</option>
        <option value="FATAL">FATAL</option>
      </NativeSelect>

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
