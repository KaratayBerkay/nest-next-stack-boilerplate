"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useToast } from "@/components/ui/Toast";
import type { RtcRecordingView } from "@/api/server/rtc/shared-types";

interface RtcRecordingControlProps {
  recording: RtcRecordingView | null | undefined;
  onStart: () => Promise<unknown>;
  onStop: () => Promise<unknown>;
}

/** Host/broadcaster-only start/stop control — see RtcRecordingService's doc
 *  comment: this only persists intent, no video is actually captured yet.
 *  The note stays visible whenever a recording is "in progress" so nobody
 *  mistakenly relies on it. */
export function RtcRecordingControl({
  recording,
  onStart,
  onStop,
}: RtcRecordingControlProps) {
  const t = useMessages("rtc");
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const isRecording = recording?.status === "RECORDING";

  const handleClick = async () => {
    setBusy(true);
    try {
      if (isRecording) await onStop();
      else await onStart();
    } catch {
      toast({ title: t.recordingActionFailed, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant={isRecording ? "destructive" : "outline"}
        onClick={() => void handleClick()}
        disabled={busy}
      >
        <span
          aria-hidden
          className={`size-2 rounded-full ${
            isRecording ? "bg-error-fg animate-pulse" : "bg-error"
          }`}
        />
        {isRecording ? t.stopRecording : t.startRecording}
      </Button>
      {isRecording && (
        <span className="bg-warning/10 border-warning/30 text-warning max-w-56 truncate rounded-full border px-2.5 py-1 text-[10px]">
          {t.recordingComingSoonNote}
        </span>
      )}
    </div>
  );
}
