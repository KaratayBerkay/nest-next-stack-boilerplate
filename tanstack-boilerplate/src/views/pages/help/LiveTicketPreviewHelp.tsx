"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import {
  IconCircleCheck,
  IconClock,
  IconMail,
  IconPaperclip,
  IconSend,
  IconTicket,
  IconX,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonGroup, ButtonGroupItem, IconButton } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithHelpMessages } from "@/types/pages/help/HelpMessages-types";

type PriorityId = "low" | "medium" | "high" | "urgent";

interface PriorityOption {
  id: PriorityId;
  labelKey: string;
  dotClassName: string;
}

const PRIORITY_OPTIONS: PriorityOption[] = [
  { id: "low", labelKey: "help4PriorityLowLabel", dotClassName: "bg-info" },
  {
    id: "medium",
    labelKey: "help4PriorityMediumLabel",
    dotClassName: "bg-warning",
  },
  { id: "high", labelKey: "help4PriorityHighLabel", dotClassName: "bg-error" },
  {
    id: "urgent",
    labelKey: "help4PriorityUrgentLabel",
    dotClassName: "bg-error",
  },
];

const PRIORITY_BADGE_VARIANT: Record<PriorityId, "info" | "warning" | "error"> = {
  low: "info",
  medium: "warning",
  high: "error",
  urgent: "error",
};

interface CategoryOption {
  id: string;
  labelKey: string;
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  { id: "billing", labelKey: "help4CategoryBillingLabel" },
  { id: "technical", labelKey: "help4CategoryTechnicalLabel" },
  { id: "account", labelKey: "help4CategoryAccountLabel" },
  { id: "feature", labelKey: "help4CategoryFeatureLabel" },
  { id: "other", labelKey: "help4CategoryOtherLabel" },
];

const MOCK_TICKET_ID = "HLP-4521";
const DEFAULT_CATEGORY_ID = CATEGORY_OPTIONS[0].id;
const DEFAULT_PRIORITY_ID: PriorityId = "medium";

function handleTicketSubmit(
  event: FormEvent<HTMLFormElement>,
  setSubmitted: Dispatch<SetStateAction<boolean>>,
) {
  event.preventDefault();
  setSubmitted(true);
}

function handleReset(
  setSubmitted: Dispatch<SetStateAction<boolean>>,
  setSubject: Dispatch<SetStateAction<string>>,
  setCategoryId: Dispatch<SetStateAction<string>>,
  setPriorityId: Dispatch<SetStateAction<PriorityId>>,
  setHasAttachment: Dispatch<SetStateAction<boolean>>,
) {
  setSubmitted(false);
  setSubject("");
  setCategoryId(DEFAULT_CATEGORY_ID);
  setPriorityId(DEFAULT_PRIORITY_ID);
  setHasAttachment(false);
}

export function LiveTicketPreviewHelp() {
  const t = useMessages("pages") as unknown as PagesWithHelpMessages;
  const h = t.help;
  const [subject, setSubject] = useState("");
  const [categoryId, setCategoryId] = useState(DEFAULT_CATEGORY_ID);
  const [priorityId, setPriorityId] = useState<PriorityId>(
    DEFAULT_PRIORITY_ID,
  );
  const [hasAttachment, setHasAttachment] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const activePriority =
    PRIORITY_OPTIONS.find((option) => option.id === priorityId) ??
    PRIORITY_OPTIONS[1];
  const activeCategory =
    CATEGORY_OPTIONS.find((option) => option.id === categoryId) ??
    CATEGORY_OPTIONS[0];

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mb-10 flex max-w-2xl flex-col gap-3 lg:mb-14">
          <div className="text-brand flex items-center gap-2">
            <IconTicket size={20} />
            <span className="text-xs font-semibold tracking-wider uppercase">
              {h.help4Eyebrow}
            </span>
          </div>
          <h2 className="text-fg text-3xl font-medium tracking-tight md:text-4xl">
            {h.help4Heading}
          </h2>
          <p className="text-muted text-lg">{h.help4Description}</p>
        </div>

        {submitted ? (
          <div className="border-border bg-surface mx-auto flex max-w-lg flex-col items-center gap-4 rounded-2xl border p-10 text-center lg:p-14">
            <span className="bg-success/10 text-success flex size-14 items-center justify-center rounded-full">
              <IconCircleCheck size={28} />
            </span>
            <div className="flex flex-col gap-2">
              <span className="text-fg text-xl font-semibold">
                {h.help4SuccessTitle}
              </span>
              <p className="text-muted text-sm">
                {h.help4SuccessDescription}
              </p>
            </div>
            <span className="border-border bg-bg text-fg rounded-full border px-4 py-1.5 font-mono text-sm">
              #{MOCK_TICKET_ID}
            </span>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                handleReset(
                  setSubmitted,
                  setSubject,
                  setCategoryId,
                  setPriorityId,
                  setHasAttachment,
                )
              }
            >
              {h.help4ResetLabel}
            </Button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:gap-10">
            <form
              onSubmit={(event) => handleTicketSubmit(event, setSubmitted)}
              className="border-border bg-bg flex flex-col gap-5 rounded-2xl border p-6 shadow-xs lg:p-8"
            >
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="help4-subject" required>
                  {h.help4SubjectLabel}
                </Label>
                <Input
                  id="help4-subject"
                  required
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder={h.help4SubjectPlaceholder}
                  leftIcon={<IconTicket size={16} />}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="help4-category">
                    {h.help4CategoryLabel}
                  </Label>
                  <Select
                    value={categoryId}
                    onValueChange={setCategoryId}
                    name="help4-category"
                  >
                    <SelectTrigger id="help4-category">
                      {categoryId
                        ? h[activeCategory.labelKey]
                        : h.help4CategoryPlaceholder}
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {h[option.labelKey]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="help4-email" required>
                    {h.help4EmailLabel}
                  </Label>
                  <Input
                    id="help4-email"
                    type="email"
                    required
                    placeholder={h.help4EmailPlaceholder}
                    leftIcon={<IconMail size={16} />}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>{h.help4PriorityLabel}</Label>
                <ButtonGroup className="w-full">
                  {PRIORITY_OPTIONS.map((option) => (
                    <ButtonGroupItem
                      key={option.id}
                      active={priorityId === option.id}
                      onClick={() => setPriorityId(option.id)}
                      className="flex-1"
                    >
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          option.dotClassName,
                        )}
                        aria-hidden="true"
                      />
                      {h[option.labelKey]}
                    </ButtonGroupItem>
                  ))}
                </ButtonGroup>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="help4-description" required>
                  {h.help4DescriptionLabel}
                </Label>
                <Textarea
                  id="help4-description"
                  required
                  rows={5}
                  placeholder={h.help4DescriptionPlaceholder}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-fg text-sm font-medium">
                  {h.help4AttachmentsLabel}
                </span>
                {hasAttachment ? (
                  <div className="border-border bg-surface flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
                    <span className="flex min-w-0 items-center gap-2 text-sm">
                      <IconPaperclip
                        size={16}
                        className="text-muted shrink-0"
                      />
                      <span className="truncate">
                        {h.help4AttachmentFileName}
                      </span>
                    </span>
                    <IconButton
                      icon={<IconX size={14} />}
                      label={h.help4RemoveAttachmentAria}
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setHasAttachment(false)}
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setHasAttachment(true)}
                    className="border-border text-muted hover:border-brand hover:text-brand flex flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-6 text-sm transition-colors"
                  >
                    <IconPaperclip size={18} />
                    {h.help4AttachmentCta}
                  </button>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                rightIcon={<IconSend size={16} />}
              >
                {h.help4SubmitLabel}
              </Button>
            </form>

            <div className="border-border bg-surface flex h-fit flex-col gap-5 rounded-2xl border p-6 lg:sticky lg:top-24 lg:p-8">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted font-mono text-xs tracking-wide">
                  #{MOCK_TICKET_ID}
                </span>
                <Badge variant="soft" pill>
                  {h.help4StatusOpenLabel}
                </Badge>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-muted text-xs font-medium tracking-wider uppercase">
                  {h.help4PreviewSubjectLabel}
                </span>
                <p className="text-fg text-lg leading-snug font-semibold">
                  {subject.trim() ? subject : h.help4PreviewSubjectPlaceholder}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{h[activeCategory.labelKey]}</Badge>
                <Badge
                  variant={PRIORITY_BADGE_VARIANT[activePriority.id]}
                  className="gap-1.5"
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      activePriority.dotClassName,
                    )}
                    aria-hidden="true"
                  />
                  {h[activePriority.labelKey]}
                </Badge>
              </div>
              {hasAttachment && (
                <div className="border-border bg-bg flex items-center gap-2 rounded-lg border px-3 py-2 text-xs">
                  <IconPaperclip size={14} className="text-muted shrink-0" />
                  <span className="text-fg truncate">
                    {h.help4AttachmentFileName}
                  </span>
                </div>
              )}
              <div className="border-border text-muted flex items-center gap-2 border-t pt-4 text-xs">
                <IconClock size={14} />
                <span>{h.help4PreviewEta}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
