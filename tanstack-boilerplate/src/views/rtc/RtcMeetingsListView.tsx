"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  IconPlus,
  IconCopy,
  IconClock,
  IconChevronDown,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Accordion, AccordionItemComplex } from "@/components/ui/Accordion";
import { PulseBlockFallback } from "@/fallbacks";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { RtcCreateMeetingDialog } from "@/components/rtc/RtcCreateMeetingDialog";
import { myMeetingsQueryOptions } from "@/api/client/rtc/meetings-query";
import { useMeetingActions } from "@/api/client/rtc/meetings-actions";
import type {
  MeetingAttendee,
  MeetingView,
} from "@/api/server/rtc/meetings/types";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { I18nMessages } from "@/generated/i18n-messages";
import {
  getRelativeTime,
  formatDurationShort,
  formatTimeShort,
  formatDateTimeShort,
} from "@/lib/date-time";

type RtcMessages = I18nMessages["rtc"];

/** Overlapping avatar row of who joined — up to five faces plus a "+N". */
function AttendeeAvatars({ attendees }: { attendees: MeetingAttendee[] }) {
  if (attendees.length === 0) return null;
  const shown = attendees.slice(0, 5);
  const extra = attendees.length - shown.length;
  return (
    <div className="flex items-center -space-x-2">
      {shown.map((a) => (
        <Avatar
          key={a.userId}
          src={a.avatarUrl ?? undefined}
          fallback={a.name || "?"}
          size="sm"
          className="ring-bg ring-2"
        />
      ))}
      {extra > 0 && (
        <span className="bg-surface-hover text-muted ring-bg flex size-8 items-center justify-center rounded-full text-[0.625rem] font-medium ring-2">
          +{extra}
        </span>
      )}
    </div>
  );
}

function hostLine(
  meeting: MeetingView,
  myId: string | undefined,
  t: RtcMessages,
) {
  return meeting.host.id === myId
    ? t.hostedByYou
    : t.hostedBy.replace("{name}", meeting.host.name || meeting.host.email);
}

/** Card for a meeting that's live right now — who's in it, plus Join. */
function ActiveMeetingCard({
  meeting,
  myId,
  lang,
  onCopyLink,
  t,
}: {
  meeting: MeetingView;
  myId: string | undefined;
  lang: string;
  onCopyLink: (slug: string) => void;
  t: RtcMessages;
}) {
  const inRoom = (meeting.participants ?? []).filter((p) => p.leftAt === null);
  return (
    <div className="border-success/30 bg-success/5 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2" aria-hidden>
              <span className="bg-success absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
              <span className="bg-success relative inline-flex size-2 rounded-full" />
            </span>
            <span className="text-success text-xs font-medium">
              {t.meetingActiveLabel}
            </span>
          </div>
          <p className="mt-1 truncate text-base font-semibold">
            {meeting.title}
          </p>
          <p className="text-muted mt-0.5 text-xs">
            {hostLine(meeting, myId, t)}
            {meeting.room.startedAt && (
              <> · {getRelativeTime(meeting.room.startedAt)}</>
            )}
          </p>
        </div>
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={() => onCopyLink(meeting.slug)}
          aria-label={t.copyLink}
        >
          <IconCopy size={16} />
        </Button>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <AttendeeAvatars attendees={inRoom} />
          <span className="text-muted truncate text-xs">
            {t.inMeetingCount.replace("{count}", String(inRoom.length))}
          </span>
        </div>
        <Link href={`/v1/${lang}/rtc/meetings/${meeting.slug}`}>
          <Button size="sm">{t.join}</Button>
        </Link>
      </div>
    </div>
  );
}

/** One expanded-detail line per attendee: who, when they joined, and how
 *  long they were in the meeting. */
function AttendeeDetailRow({
  attendee,
  meetingEndedAt,
  t,
}: {
  attendee: MeetingAttendee;
  meetingEndedAt: string | null;
  t: RtcMessages;
}) {
  // finishMeeting stamps leftAt for everyone still in the room, but fall
  // back to the room's end for any row that predates that guarantee.
  const leftAt = attendee.leftAt ?? meetingEndedAt;
  return (
    <div className="flex items-center gap-3 py-2">
      <Avatar
        src={attendee.avatarUrl ?? undefined}
        fallback={attendee.name || "?"}
        size="sm"
      />
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        <span className="truncate text-sm font-medium">{attendee.name}</span>
        {attendee.role === "HOST" && (
          <Badge variant="secondary">{t.hostLabel}</Badge>
        )}
      </div>
      <div className="text-muted shrink-0 text-right text-xs">
        <p>
          {t.joinedAtTime.replace("{time}", formatTimeShort(attendee.joinedAt))}
        </p>
        {leftAt && (
          <p className="mt-0.5 flex items-center justify-end gap-1">
            <IconClock size={11} aria-hidden />
            {formatDurationShort(attendee.joinedAt, leftAt)}
          </p>
        )}
      </div>
    </div>
  );
}

/** Accordion item for an ended meeting — the header mirrors the old static
 *  row; expanding it reveals the per-attendee join/time-spent detail. */
function HistoryMeetingItem({
  meeting,
  myId,
  t,
}: {
  meeting: MeetingView;
  myId: string | undefined;
  t: RtcMessages;
}) {
  const attended = meeting.participants ?? [];
  const { startedAt, endedAt } = meeting.room;
  return (
    <AccordionItemComplex
      value={meeting.id}
      centerSlot={
        <div className="min-w-0 text-left">
          <p className="flex items-baseline gap-2 text-sm font-medium">
            <span className="truncate">{meeting.title}</span>
            {/* Absolute stamp — identically-titled meetings ("Today's
                meeting" × 3) stay tellable-apart. */}
            <span className="text-muted shrink-0 text-xs font-normal">
              {formatDateTimeShort(startedAt ?? meeting.createdAt)}
            </span>
          </p>
          <p className="text-muted mt-0.5 flex items-center gap-1.5 text-xs font-normal">
            <span className="truncate">{hostLine(meeting, myId, t)}</span>
            <span aria-hidden>·</span>
            <span className="shrink-0">
              {getRelativeTime(endedAt ?? meeting.createdAt)}
            </span>
            {startedAt && endedAt && (
              <>
                <span aria-hidden>·</span>
                <span className="flex shrink-0 items-center gap-0.5">
                  <IconClock size={12} aria-hidden />
                  {formatDurationShort(startedAt, endedAt)}
                </span>
              </>
            )}
          </p>
        </div>
      }
      rightSlot={
        <div className="flex items-center gap-2">
          <AttendeeAvatars attendees={attended} />
          {attended.length > 0 && (
            <span className="text-muted hidden text-xs font-normal sm:inline">
              {t.attendedCount.replace("{count}", String(attended.length))}
            </span>
          )}
          <IconChevronDown
            size={16}
            className="text-muted transition-transform duration-200 [[data-state=open]_&]:rotate-180"
            aria-hidden
          />
        </div>
      }
      content={
        attended.length === 0 ? (
          <p className="text-muted text-xs">
            {t.attendedCount.replace("{count}", "0")}
          </p>
        ) : (
          <div className="flex flex-col">
            {attended.map((attendee) => (
              <AttendeeDetailRow
                key={attendee.userId}
                attendee={attendee}
                meetingEndedAt={endedAt}
                t={t}
              />
            ))}
          </div>
        )
      }
    />
  );
}

export function RtcMeetingsListView() {
  const t = useMessages("rtc");
  const params = useParams<{ lang: string }>();
  const lang = params?.lang ?? "en";
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { createMeeting, inviteToMeeting } = useMeetingActions();

  const { data: meetings, isLoading } = useQuery(myMeetingsQueryOptions());

  const handleCreate = async (title: string, inviteeIds: string[]) => {
    let meeting: Awaited<ReturnType<typeof createMeeting>>;
    try {
      meeting = await createMeeting(title);
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : t.createMeetingFailed,
        variant: "destructive",
      });
      throw err;
    }
    // The meeting exists from here on — invite failures must not strand the
    // host outside their own room, so they surface as a toast, not a throw.
    const results = await Promise.allSettled(
      inviteeIds.map((userId) => inviteToMeeting(meeting.slug, userId)),
    );
    if (results.some((r) => r.status === "rejected")) {
      toast({ title: t.inviteSomeFailed, variant: "destructive" });
    }
    await queryClient.invalidateQueries({
      queryKey: ["rtc", "meetings", "mine"],
    });
    router.push(`/v1/${lang}/rtc/meetings/${meeting.slug}`);
  };

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/v1/${lang}/rtc/meetings/${slug}`;
    navigator.clipboard
      .writeText(url)
      .then(() => toast({ title: t.linkCopied }))
      .catch(() => toast({ title: t.linkCopyFailed, variant: "destructive" }));
  };

  const active = (meetings ?? []).filter((m) => m.room.state === "ACTIVE");
  const history = (meetings ?? []).filter((m) => m.room.state !== "ACTIVE");

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t.myMeetingsTitle}</h1>
        <RtcCreateMeetingDialog onSubmit={handleCreate}>
          {(open) => (
            <Button size="sm" onClick={open}>
              <IconPlus size={16} />
              {t.newMeeting}
            </Button>
          )}
        </RtcCreateMeetingDialog>
      </div>

      {isLoading ? (
        <PulseBlockFallback />
      ) : !meetings || meetings.length === 0 ? (
        <p className="text-muted text-sm">{t.noMeetings}</p>
      ) : (
        <>
          <section className="flex flex-col gap-3">
            <h2 className="text-muted text-xs font-medium tracking-wide uppercase">
              {t.activeMeetingsTitle}
            </h2>
            {active.length === 0 ? (
              <p className="text-muted text-sm">{t.noActiveMeetings}</p>
            ) : (
              active.map((meeting) => (
                <ActiveMeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  myId={user?.id}
                  lang={lang}
                  onCopyLink={copyLink}
                  t={t}
                />
              ))
            )}
          </section>

          {history.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-muted text-xs font-medium tracking-wide uppercase">
                {t.meetingHistoryTitle}
              </h2>
              <Accordion
                type="single"
                collapsible
                className="w-full overflow-hidden rounded-lg border"
              >
                {history.map((meeting) => (
                  <HistoryMeetingItem
                    key={meeting.id}
                    meeting={meeting}
                    myId={user?.id}
                    t={t}
                  />
                ))}
              </Accordion>
            </section>
          )}
        </>
      )}
    </div>
  );
}
