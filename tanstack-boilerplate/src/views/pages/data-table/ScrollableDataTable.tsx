"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDataTableMessages } from "@/types/pages/data-table/DataTableMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

type AccountTone = "success" | "warning" | "error" | "info";

const PILL_TONES: Record<AccountTone, string> = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  error: "bg-error/10 text-error",
  info: "bg-info/10 text-info",
};

interface ScrollableAccount {
  avatarSeed: string;
  nameKey: string;
  emailKey: string;
  planKey: string;
  countryKey: string;
  statusKey: string;
  tone: AccountTone;
  joinedKey: string;
  spendKey: string;
  methodKey: string;
}

const SCROLLABLE_ACCOUNTS: ScrollableAccount[] = [
  {
    avatarSeed: "data-table-4-customer-1",
    nameKey: "dataTable4Name1",
    emailKey: "dataTable4Email1",
    planKey: "dataTable4PlanStarter",
    countryKey: "dataTable4Country1",
    statusKey: "dataTable4StatusActive",
    tone: "success",
    joinedKey: "dataTable4Joined1",
    spendKey: "dataTable4Spend1",
    methodKey: "dataTable4Method1",
  },
  {
    avatarSeed: "data-table-4-customer-2",
    nameKey: "dataTable4Name2",
    emailKey: "dataTable4Email2",
    planKey: "dataTable4PlanPro",
    countryKey: "dataTable4Country2",
    statusKey: "dataTable4StatusTrial",
    tone: "info",
    joinedKey: "dataTable4Joined2",
    spendKey: "dataTable4Spend2",
    methodKey: "dataTable4Method2",
  },
  {
    avatarSeed: "data-table-4-customer-3",
    nameKey: "dataTable4Name3",
    emailKey: "dataTable4Email3",
    planKey: "dataTable4PlanEnterprise",
    countryKey: "dataTable4Country3",
    statusKey: "dataTable4StatusActive",
    tone: "success",
    joinedKey: "dataTable4Joined3",
    spendKey: "dataTable4Spend3",
    methodKey: "dataTable4Method3",
  },
  {
    avatarSeed: "data-table-4-customer-4",
    nameKey: "dataTable4Name4",
    emailKey: "dataTable4Email4",
    planKey: "dataTable4PlanPro",
    countryKey: "dataTable4Country4",
    statusKey: "dataTable4StatusCancelled",
    tone: "error",
    joinedKey: "dataTable4Joined4",
    spendKey: "dataTable4Spend4",
    methodKey: "dataTable4Method4",
  },
  {
    avatarSeed: "data-table-4-customer-5",
    nameKey: "dataTable4Name5",
    emailKey: "dataTable4Email5",
    planKey: "dataTable4PlanEnterprise",
    countryKey: "dataTable4Country5",
    statusKey: "dataTable4StatusActive",
    tone: "success",
    joinedKey: "dataTable4Joined5",
    spendKey: "dataTable4Spend5",
    methodKey: "dataTable4Method5",
  },
  {
    avatarSeed: "data-table-4-customer-6",
    nameKey: "dataTable4Name6",
    emailKey: "dataTable4Email6",
    planKey: "dataTable4PlanStarter",
    countryKey: "dataTable4Country6",
    statusKey: "dataTable4StatusTrial",
    tone: "info",
    joinedKey: "dataTable4Joined6",
    spendKey: "dataTable4Spend6",
    methodKey: "dataTable4Method6",
  },
  {
    avatarSeed: "data-table-4-customer-7",
    nameKey: "dataTable4Name7",
    emailKey: "dataTable4Email7",
    planKey: "dataTable4PlanPro",
    countryKey: "dataTable4Country7",
    statusKey: "dataTable4StatusActive",
    tone: "success",
    joinedKey: "dataTable4Joined7",
    spendKey: "dataTable4Spend7",
    methodKey: "dataTable4Method7",
  },
  {
    avatarSeed: "data-table-4-customer-8",
    nameKey: "dataTable4Name8",
    emailKey: "dataTable4Email8",
    planKey: "dataTable4PlanPro",
    countryKey: "dataTable4Country8",
    statusKey: "dataTable4StatusActive",
    tone: "success",
    joinedKey: "dataTable4Joined8",
    spendKey: "dataTable4Spend8",
    methodKey: "dataTable4Method8",
  },
];

function StatusPill({ label, tone }: { label: string; tone: AccountTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        PILL_TONES[tone],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

export function ScrollableDataTable() {
  const t = useMessages("pages") as unknown as PagesWithDataTableMessages;
  const d = t.dataTable;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col items-center gap-3 text-center">
          <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
            {d.dataTable4Heading}
          </h2>
          <p className="text-muted text-lg">{d.dataTable4Description}</p>
        </div>
        <div className="bg-surface border-border w-full rounded-xl border shadow-xs">
          <Table className="min-w-[880px]">
            <TableHeader>
              <TableRow>
                <TableHead>{d.dataTable4ColCustomer}</TableHead>
                <TableHead>{d.dataTable4ColEmail}</TableHead>
                <TableHead>{d.dataTable4ColPlan}</TableHead>
                <TableHead>{d.dataTable4ColCountry}</TableHead>
                <TableHead>{d.dataTable4ColStatus}</TableHead>
                <TableHead>{d.dataTable4ColJoined}</TableHead>
                <TableHead className="text-right">
                  {d.dataTable4ColSpend}
                </TableHead>
                <TableHead>{d.dataTable4ColMethod}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SCROLLABLE_ACCOUNTS.map((account) => (
                <TableRow key={account.nameKey}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={placeholderImage(account.avatarSeed, "1x1")}
                        fallback=""
                        size="sm"
                      />
                      <span className="font-medium whitespace-nowrap">
                        {d[account.nameKey]}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted whitespace-nowrap">
                    {d[account.emailKey]}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {d[account.planKey]}
                  </TableCell>
                  <TableCell className="text-muted whitespace-nowrap">
                    {d[account.countryKey]}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <StatusPill
                      label={d[account.statusKey]}
                      tone={account.tone}
                    />
                  </TableCell>
                  <TableCell className="text-muted whitespace-nowrap">
                    {d[account.joinedKey]}
                  </TableCell>
                  <TableCell className="text-right font-medium whitespace-nowrap">
                    {d[account.spendKey]}
                  </TableCell>
                  <TableCell className="text-muted whitespace-nowrap">
                    {d[account.methodKey]}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
