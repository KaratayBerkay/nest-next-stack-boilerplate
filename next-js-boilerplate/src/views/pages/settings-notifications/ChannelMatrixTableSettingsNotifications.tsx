"use client";

import { useState } from "react";
import { IconDeviceMobileMessage, IconMail } from "@tabler/icons-react";
import { Checkbox } from "@/components/ui/Checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithSettingsNotificationsMessages } from "@/types/pages/settings-notifications/SettingsNotificationsMessages-types";

type Channel = "email" | "push";

interface MatrixRow {
  id: string;
  labelKey: string;
  descKey: string;
  defaultEmail: boolean;
  defaultPush: boolean;
}

const ROWS: MatrixRow[] = [
  {
    id: "comments",
    labelKey: "settingsNotifications4Row1Label",
    descKey: "settingsNotifications4Row1Desc",
    defaultEmail: true,
    defaultPush: true,
  },
  {
    id: "mentions",
    labelKey: "settingsNotifications4Row2Label",
    descKey: "settingsNotifications4Row2Desc",
    defaultEmail: true,
    defaultPush: true,
  },
  {
    id: "followers",
    labelKey: "settingsNotifications4Row3Label",
    descKey: "settingsNotifications4Row3Desc",
    defaultEmail: false,
    defaultPush: true,
  },
  {
    id: "digest",
    labelKey: "settingsNotifications4Row4Label",
    descKey: "settingsNotifications4Row4Desc",
    defaultEmail: true,
    defaultPush: false,
  },
  {
    id: "product",
    labelKey: "settingsNotifications4Row5Label",
    descKey: "settingsNotifications4Row5Desc",
    defaultEmail: false,
    defaultPush: false,
  },
];

interface CellState {
  email: boolean;
  push: boolean;
}

const INITIAL_STATE: Record<string, CellState> = Object.fromEntries(
  ROWS.map((row) => [
    row.id,
    { email: row.defaultEmail, push: row.defaultPush },
  ]),
);

export function ChannelMatrixTableSettingsNotifications() {
  const t = useMessages(
    "pages",
  ) as unknown as PagesWithSettingsNotificationsMessages;
  const sn = t.settingsNotifications;

  const [values, setValues] =
    useState<Record<string, CellState>>(INITIAL_STATE);

  const emailAllOn = ROWS.every((row) => values[row.id].email);
  const pushAllOn = ROWS.every((row) => values[row.id].push);

  function toggleColumn(channel: Channel) {
    const next = channel === "email" ? !emailAllOn : !pushAllOn;
    setValues((prev) => {
      const copy: Record<string, CellState> = {};
      for (const row of ROWS) {
        copy[row.id] = { ...prev[row.id], [channel]: next };
      }
      return copy;
    });
  }

  function toggleCell(id: string, channel: Channel, checked: boolean) {
    setValues((prev) => ({
      ...prev,
      [id]: { ...prev[id], [channel]: checked },
    }));
  }

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="flex flex-col gap-1 pb-6">
          <h3 className="text-fg text-base font-semibold">
            {sn.settingsNotifications4Heading}
          </h3>
          <p className="text-muted text-sm">
            {sn.settingsNotifications4Subheading}
          </p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{sn.settingsNotifications4EventColLabel}</TableHead>
              <TableHead>
                <div className="flex flex-col items-center gap-1.5">
                  <span className="flex items-center gap-1.5">
                    <IconMail size={14} aria-hidden="true" />
                    {sn.settingsNotifications4EmailColLabel}
                  </span>
                  <Checkbox
                    checked={emailAllOn}
                    onChange={() => toggleColumn("email")}
                    aria-label={sn.settingsNotifications4EmailSelectAllAria}
                    size="sm"
                  />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex flex-col items-center gap-1.5">
                  <span className="flex items-center gap-1.5">
                    <IconDeviceMobileMessage size={14} aria-hidden="true" />
                    {sn.settingsNotifications4PushColLabel}
                  </span>
                  <Checkbox
                    checked={pushAllOn}
                    onChange={() => toggleColumn("push")}
                    aria-label={sn.settingsNotifications4PushSelectAllAria}
                    size="sm"
                  />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ROWS.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-fg text-sm font-medium">
                      {sn[row.labelKey]}
                    </span>
                    <span className="text-muted text-xs">
                      {sn[row.descKey]}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    <Checkbox
                      checked={values[row.id].email}
                      onChange={(e) =>
                        toggleCell(row.id, "email", e.target.checked)
                      }
                      aria-label={sn.settingsNotifications4EmailCellAriaTemplate.replace(
                        "{event}",
                        sn[row.labelKey],
                      )}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    <Checkbox
                      checked={values[row.id].push}
                      onChange={(e) =>
                        toggleCell(row.id, "push", e.target.checked)
                      }
                      aria-label={sn.settingsNotifications4PushCellAriaTemplate.replace(
                        "{event}",
                        sn[row.labelKey],
                      )}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
