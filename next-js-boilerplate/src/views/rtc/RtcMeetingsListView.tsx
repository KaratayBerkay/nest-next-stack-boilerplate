"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { IconPlus, IconUsers, IconCopy } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { PulseBlockFallback } from "@/fallbacks";
import { useToast } from "@/components/ui/Toast";
import { myMeetingsQueryOptions } from "@/api/client/rtc/meetings-query";
import { useMeetingActions } from "@/api/client/rtc/meetings-actions";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { getRelativeTime } from "@/lib/date-time";

export function RtcMeetingsListView() {
  const t = useMessages("rtc");
  const params = useParams<{ lang: string }>();
  const lang = params?.lang ?? "en";
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { createMeeting } = useMeetingActions();

  const { data: meetings, isLoading } = useQuery(myMeetingsQueryOptions());
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setCreating(true);
    try {
      const meeting = await createMeeting(title.trim());
      await queryClient.invalidateQueries({
        queryKey: ["rtc", "meetings", "mine"],
      });
      setShowCreate(false);
      setTitle("");
      window.location.href = `/v1/${lang}/rtc/meetings/${meeting.slug}`;
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : t.createMeetingFailed,
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/v1/${lang}/rtc/meetings/${slug}`;
    navigator.clipboard
      .writeText(url)
      .then(() => toast({ title: t.linkCopied }))
      .catch(() => toast({ title: t.linkCopyFailed, variant: "destructive" }));
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t.myMeetingsTitle}</h1>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <IconPlus size={16} />
          {t.newMeeting}
        </Button>
      </div>

      {isLoading ? (
        <PulseBlockFallback />
      ) : !meetings || meetings.length === 0 ? (
        <p className="text-fg-muted text-sm">{t.noMeetings}</p>
      ) : (
        <div className="rounded-lg border">
          {meetings.map((meeting) => (
            <div
              key={meeting.id}
              className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0"
            >
              <IconUsers
                className="text-fg-muted size-5 shrink-0"
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{meeting.title}</p>
                <div className="text-fg-muted flex items-center gap-1.5 text-xs">
                  <Badge
                    variant={
                      meeting.room.state === "ACTIVE" ? "success" : "secondary"
                    }
                  >
                    {meeting.room.state === "ACTIVE"
                      ? t.meetingActiveLabel
                      : t.meetingEndedLabel}
                  </Badge>
                  <span>{getRelativeTime(meeting.createdAt)}</span>
                </div>
              </div>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => copyLink(meeting.slug)}
                aria-label={t.copyLink}
              >
                <IconCopy size={16} />
              </Button>
              {meeting.room.state === "ACTIVE" && (
                <Link href={`/v1/${lang}/rtc/meetings/${meeting.slug}`}>
                  <Button size="sm">{t.join}</Button>
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>{t.newMeetingTitle}</DialogTitle>
          </DialogHeader>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.meetingTitlePlaceholder}
            aria-label={t.meetingTitleLabel}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>
              {t.cancel}
            </Button>
            <Button onClick={handleCreate} disabled={creating || !title.trim()}>
              {creating ? t.creating : t.create}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
