"use client";

import { useState, type ReactNode } from "react";
import {
  IconCircleCheckFilled,
  IconFlag,
  IconCircleCheck,
} from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/textarea";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useToast } from "@/components/ui/Toast";
import type { RtcReportReason } from "@/api/server/rtc/shared-types";

interface RtcReportDialogProps {
  onSubmit: (reason: RtcReportReason, details?: string) => Promise<unknown>;
  children: (open: () => void) => ReactNode;
}

const REASONS = [
  { value: "HARASSMENT", labelKey: "reportReasonHarassment" },
  { value: "SPAM", labelKey: "reportReasonSpam" },
  { value: "INAPPROPRIATE_CONTENT", labelKey: "reportReasonInappropriate" },
  { value: "OTHER", labelKey: "reportReasonOther" },
] as const satisfies ReadonlyArray<{
  value: RtcReportReason;
  labelKey:
    | "reportReasonHarassment"
    | "reportReasonSpam"
    | "reportReasonInappropriate"
    | "reportReasonOther";
}>;

/** Minimal report submission — a reason + optional free-text details,
 *  persisted server-side. No review UI reads this yet (Phase 5 scope). */
export function RtcReportDialog({ onSubmit, children }: RtcReportDialogProps) {
  const t = useMessages("rtc");
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<RtcReportReason>("HARASSMENT");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const reset = () => {
    setDone(false);
    setDetails("");
    setReason("HARASSMENT");
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit(reason, details.trim() || undefined);
      setDone(true);
    } catch {
      toast({ title: t.reportFailed, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      {children(() => setOpen(true))}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <span className="flex items-center gap-2">
              <span className="bg-error/10 text-error flex size-8 items-center justify-center rounded-full">
                <IconFlag size={16} aria-hidden />
              </span>
              {t.reportTitle}
            </span>
          </DialogTitle>
        </DialogHeader>
        {done ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <IconCircleCheckFilled
              className="text-success size-10"
              aria-hidden
            />
            <p className="text-fg text-sm">{t.reportSubmitted}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-muted text-sm">{t.reportSubtitle}</p>
            <fieldset className="flex flex-col gap-2">
              <legend className="text-fg mb-1.5 text-xs font-medium">
                {t.reportReasonLabel}
              </legend>
              {REASONS.map((r) => {
                const selected = reason === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setReason(r.value)}
                    className={`focus-visible:ring-brand flex items-center justify-between rounded-md border px-3 py-2.5 text-left text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                      selected
                        ? "border-brand bg-brand/10 text-fg"
                        : "border-border hover:bg-surface-hover text-fg"
                    }`}
                  >
                    {t[r.labelKey]}
                    {selected && (
                      <IconCircleCheck
                        size={16}
                        className="text-brand shrink-0"
                        aria-hidden
                      />
                    )}
                  </button>
                );
              })}
            </fieldset>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="rtc-report-details"
                className="text-fg text-xs font-medium"
              >
                {t.reportDetailsLabel}
              </label>
              <Textarea
                id="rtc-report-details"
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder={t.reportDetailsPlaceholder}
              />
            </div>
          </div>
        )}
        <DialogFooter>
          {done ? (
            <Button onClick={() => setOpen(false)}>{t.close}</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                {t.cancel}
              </Button>
              <Button
                variant="destructive"
                onClick={() => void handleSubmit()}
                loading={submitting}
              >
                {t.reportSubmit}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
