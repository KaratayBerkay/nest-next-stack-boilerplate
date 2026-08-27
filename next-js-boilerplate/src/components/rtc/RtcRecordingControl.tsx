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
        {isRecording ? t.stopRecording : t.startRecording}
      </Button>
      {isRecording && (
        <span className="text-fg-muted text-xs">
          {t.recordingComingSoonNote}
        </span>
      )}
    </div>
  );
}
