"use client";

import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useToast } from "@/components/ui/Toast";
import type { RtcReportReason } from "@/api/server/rtc/shared-types";

interface RtcReportDialogProps {
  onSubmit: (reason: RtcReportReason, details?: string) => Promise<unknown>;
  children: (open: () => void) => ReactNode;
}

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
          <DialogTitle>{t.reportTitle}</DialogTitle>
        </DialogHeader>
        {done ? (
          <p className="text-fg-muted text-sm">{t.reportSubmitted}</p>
        ) : (
          <div className="flex flex-col gap-3">
            <NativeSelect
              value={reason}
              onChange={(e) => setReason(e.target.value as RtcReportReason)}
              aria-label={t.reportReasonLabel}
            >
              <option value="HARASSMENT">{t.reportReasonHarassment}</option>
              <option value="SPAM">{t.reportReasonSpam}</option>
              <option value="INAPPROPRIATE_CONTENT">
                {t.reportReasonInappropriate}
              </option>
              <option value="OTHER">{t.reportReasonOther}</option>
            </NativeSelect>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={t.reportDetailsPlaceholder}
            />
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
                disabled={submitting}
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
