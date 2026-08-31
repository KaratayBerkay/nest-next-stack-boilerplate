"use client";

import {
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";
import { IconCheck, IconX } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDealsMessages } from "@/types/pages/deals/DealsMessages-types";

function handleSubscribe(
  event: FormEvent<HTMLFormElement>,
  setSubmitted: Dispatch<SetStateAction<boolean>>,
) {
  event.preventDefault();
  setSubmitted(true);
}

function handleDismiss(setVisible: Dispatch<SetStateAction<boolean>>) {
  setVisible(false);
}

export function DealsNewsletterBanner() {
  const t = useMessages("pages") as unknown as PagesWithDealsMessages;
  const d = t.deals;
  const [visible, setVisible] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div className="border-border bg-surface relative flex w-full max-w-3xl flex-col gap-4 rounded-2xl border p-4 pr-11 shadow-xs sm:flex-row sm:items-center sm:gap-5 sm:p-5 sm:pr-5">
        <Badge variant="soft" pill className="self-start sm:self-center">
          {d.deals3DiscountBadge}
        </Badge>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="text-sm font-medium sm:text-base">{d.deals3Hook}</p>
          <p className="text-muted text-xs sm:text-sm">{d.deals3Description}</p>
        </div>
        {submitted ? (
          <p
            role="status"
            className="text-brand flex items-center gap-1.5 text-sm font-medium"
          >
            <IconCheck size={16} aria-hidden="true" />
            {d.deals3Success}
          </p>
        ) : (
          <form
            onSubmit={(event) => handleSubscribe(event, setSubmitted)}
            className="flex w-full items-center gap-2 sm:w-auto"
          >
            <Input
              type="email"
              required
              aria-label={d.deals3InputAria}
              placeholder={d.deals3InputPlaceholder}
              className="min-w-0 flex-1 sm:w-52 sm:flex-none"
            />
            <Button type="submit" className="shrink-0">
              {d.deals3Subscribe}
            </Button>
          </form>
        )}
        <IconButton
          variant="ghost"
          size="icon-sm"
          label={d.deals3CloseAria}
          icon={<IconX size={16} aria-hidden="true" />}
          onClick={() => handleDismiss(setVisible)}
          className="absolute top-3 right-3 sm:static sm:self-center"
        />
      </div>
    </div>
  );
}
