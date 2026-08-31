"use client";

import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import Link from "next/link";
import { IconArrowUpRight } from "@tabler/icons-react";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithLoginMessages } from "@/types/pages/login/LoginMessages-types";

const UNDERLINE_FIELD =
  "w-full border-0 border-b border-border bg-transparent px-0 py-2.5 text-fg placeholder:text-muted/70 transition-colors focus:border-brand focus:ring-0 focus:outline-none";

function handleSubmit(
  event: FormEvent<HTMLFormElement>,
  setSubmitted: Dispatch<SetStateAction<boolean>>,
) {
  event.preventDefault();
  setSubmitted(true);
}

export function MinimalInlineLogin() {
  const t = useMessages("pages") as unknown as PagesWithLoginMessages;
  const lg = t.login;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="w-full py-20 lg:py-28">
      <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-8 px-6 text-center">
        <div className="flex flex-col gap-2">
          <Typography variant="overline">{lg.login3Eyebrow}</Typography>
          <Typography variant="h3">{lg.login3Title}</Typography>
          <Typography variant="caption">{lg.login3Description}</Typography>
        </div>

        {submitted ? (
          <p className="bg-brand/10 text-brand rounded-full px-5 py-2.5 text-sm font-medium">
            {lg.login3SuccessMessage}
          </p>
        ) : (
          <form
            onSubmit={(event) => handleSubmit(event, setSubmitted)}
            className="flex w-full flex-col gap-6 text-left"
          >
            <div className="flex flex-col gap-1">
              <label
                htmlFor="login3-email"
                className="text-fg text-sm font-medium"
              >
                {lg.login3EmailLabel}
              </label>
              <input
                id="login3-email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={lg.login3EmailPlaceholder}
                className={UNDERLINE_FIELD}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="login3-password"
                className="text-fg text-sm font-medium"
              >
                {lg.login3PasswordLabel}
              </label>
              <input
                id="login3-password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={lg.login3PasswordPlaceholder}
                className={UNDERLINE_FIELD}
              />
            </div>
            <button
              type="submit"
              className="group text-brand mx-auto inline-flex w-fit items-center gap-2 text-sm font-medium"
            >
              {lg.login3Submit}
              <IconArrowUpRight
                size={16}
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </button>
          </form>
        )}

        <div className="flex items-center gap-4">
          <Link
            href="#"
            className="text-muted hover:text-fg text-xs underline underline-offset-4"
          >
            {lg.login3ForgotPassword}
          </Link>
          <span className="text-muted/40 text-xs" aria-hidden="true">
            •
          </span>
          <Link
            href="#"
            className="text-muted hover:text-fg text-xs underline underline-offset-4"
          >
            {lg.login3CreateAccount}
          </Link>
        </div>
      </div>
    </section>
  );
}
