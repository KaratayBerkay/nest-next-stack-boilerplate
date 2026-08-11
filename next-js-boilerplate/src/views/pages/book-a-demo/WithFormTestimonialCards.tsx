"use client";

import { useState } from "react";
import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from "react";
import { IconBolt, IconStar } from "@tabler/icons-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { NativeSelect } from "@/components/ui/NativeSelect";
import { Textarea } from "@/components/ui/Textarea";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type {
  BookADemo3Testimonial,
  PagesWithBookADemoMessages,
} from "@/types/pages/book-a-demo/BookADemoMessages-types";

const TESTIMONIALS: BookADemo3Testimonial[] = [
  {
    quoteKey: "bookADemo3Testimonial1Quote",
    authorKey: "bookADemo3Testimonial1Author",
    roleKey: "bookADemo3Testimonial1Role",
    initialsKey: "bookADemo3Testimonial1Initials",
    avatarSeed: "bookademo3-1",
  },
  {
    quoteKey: "bookADemo3Testimonial2Quote",
    authorKey: "bookADemo3Testimonial2Author",
    roleKey: "bookADemo3Testimonial2Role",
    initialsKey: "bookADemo3Testimonial2Initials",
    avatarSeed: "bookademo3-2",
  },
  {
    quoteKey: "bookADemo3Testimonial3Quote",
    authorKey: "bookADemo3Testimonial3Author",
    roleKey: "bookADemo3Testimonial3Role",
    initialsKey: "bookADemo3Testimonial3Initials",
    avatarSeed: "bookademo3-3",
  },
];

const LOCATION_OPTIONS = [
  "bookADemo3FormLocationOption1",
  "bookADemo3FormLocationOption2",
  "bookADemo3FormLocationOption3",
];

const SERVICE_OPTIONS = [
  "bookADemo3FormServiceOption1",
  "bookADemo3FormServiceOption2",
  "bookADemo3FormServiceOption3",
  "bookADemo3FormServiceOption4",
];

const STAR_ICONS = [0, 1, 2, 3, 4];

function handleFieldChange(
  event: ChangeEvent<HTMLInputElement>,
  setValue: Dispatch<SetStateAction<string>>,
) {
  setValue(event.target.value);
}

function handleSelectChange(
  event: ChangeEvent<HTMLSelectElement>,
  setValue: Dispatch<SetStateAction<string>>,
) {
  setValue(event.target.value);
}

function handleMessageChange(
  event: ChangeEvent<HTMLTextAreaElement>,
  setValue: Dispatch<SetStateAction<string>>,
) {
  setValue(event.target.value);
}

function handleSubmit(
  event: FormEvent<HTMLFormElement>,
  setName: Dispatch<SetStateAction<string>>,
  setEmail: Dispatch<SetStateAction<string>>,
  setLocation: Dispatch<SetStateAction<string>>,
  setService: Dispatch<SetStateAction<string>>,
  setMessage: Dispatch<SetStateAction<string>>,
) {
  event.preventDefault();
  setName("");
  setEmail("");
  setLocation("");
  setService("");
  setMessage("");
}

export function WithFormTestimonialCards() {
  const t = useMessages("pages") as unknown as PagesWithBookADemoMessages;
  const bp = t.bookADemo;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [service, setService] = useState("");
  const [message, setMessage] = useState("");

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col px-4 lg:px-8">
        <div className="flex flex-col gap-12 lg:grid lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <Typography
                variant="h2"
                className="text-4xl font-medium tracking-tighter md:text-5xl"
              >
                {bp.bookADemo3Heading}
              </Typography>
              <Typography variant="bodyLarge" className="text-muted">
                {bp.bookADemo3Description}
              </Typography>
            </div>
            <div className="grid gap-4">
              {TESTIMONIALS.map((testimonial) => (
                <figure
                  key={testimonial.avatarSeed}
                  className="border-border bg-surface flex flex-col gap-4 rounded-2xl border p-6"
                >
                  <div className="flex items-center gap-0.5">
                    {STAR_ICONS.map((star) => (
                      <IconStar
                        key={star}
                        size={14}
                        className="fill-brand text-brand"
                      />
                    ))}
                  </div>
                  <blockquote className="text-sm leading-relaxed">
                    {bp[testimonial.quoteKey]}
                  </blockquote>
                  <figcaption className="flex items-center gap-3">
                    <Avatar
                      src={`https://picsum.photos/seed/${testimonial.avatarSeed}/64/64`}
                      alt={bp[testimonial.authorKey]}
                      fallback={bp[testimonial.initialsKey]}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {bp[testimonial.authorKey]}
                      </span>
                      <Typography variant="caption">
                        {bp[testimonial.roleKey]}
                      </Typography>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>

          <form
            onSubmit={(event) =>
              handleSubmit(
                event,
                setName,
                setEmail,
                setLocation,
                setService,
                setMessage,
              )
            }
            className="border-border bg-surface flex h-fit flex-col gap-4 rounded-2xl border p-6 lg:p-8"
          >
            <span className="border-border flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium">
              <IconBolt size={14} className="text-brand" />
              {bp.bookADemo3FormPoweredBy}
            </span>
            <div className="flex flex-col gap-1">
              <Typography variant="h3" className="text-xl font-medium">
                {bp.bookADemo3FormHeading}
              </Typography>
              <Typography variant="bodySmall" className="text-muted">
                {bp.bookADemo3FormDescription}
              </Typography>
            </div>
            <div className="border-border border-t border-dashed" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="book-a-demo3-name"
                  className="text-sm font-medium"
                >
                  {bp.bookADemo3FormNameLabel}
                </label>
                <Input
                  id="book-a-demo3-name"
                  type="text"
                  required
                  value={name}
                  onChange={(event) => handleFieldChange(event, setName)}
                  placeholder={bp.bookADemo3FormNamePlaceholder}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="book-a-demo3-email"
                  className="text-sm font-medium"
                >
                  {bp.bookADemo3FormEmailLabel}
                </label>
                <Input
                  id="book-a-demo3-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => handleFieldChange(event, setEmail)}
                  placeholder={bp.bookADemo3FormEmailPlaceholder}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="book-a-demo3-location"
                  className="text-sm font-medium"
                >
                  {bp.bookADemo3FormLocationLabel}
                </label>
                <NativeSelect
                  id="book-a-demo3-location"
                  required
                  value={location}
                  onChange={(event) => handleSelectChange(event, setLocation)}
                >
                  <option value="" disabled>
                    {bp.bookADemo3FormLocationPlaceholder}
                  </option>
                  {LOCATION_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {bp[option]}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="book-a-demo3-service"
                  className="text-sm font-medium"
                >
                  {bp.bookADemo3FormServiceLabel}
                </label>
                <NativeSelect
                  id="book-a-demo3-service"
                  required
                  value={service}
                  onChange={(event) => handleSelectChange(event, setService)}
                >
                  <option value="" disabled>
                    {bp.bookADemo3FormServicePlaceholder}
                  </option>
                  {SERVICE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {bp[option]}
                    </option>
                  ))}
                </NativeSelect>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="book-a-demo3-message"
                className="text-sm font-medium"
              >
                {bp.bookADemo3FormMessageLabel}
              </label>
              <Textarea
                id="book-a-demo3-message"
                required
                value={message}
                onChange={(event) => handleMessageChange(event, setMessage)}
                placeholder={bp.bookADemo3FormMessagePlaceholder}
              />
            </div>
            <Button type="submit" variant="primary" className="w-full">
              {bp.bookADemo3FormSubmit}
            </Button>
            <Typography variant="caption" className="text-center">
              {bp.bookADemo3FormNote}
            </Typography>
          </form>
        </div>
      </div>
    </section>
  );
}
