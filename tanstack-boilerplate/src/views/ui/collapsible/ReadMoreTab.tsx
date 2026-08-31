"use client";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/Collapsible";

export function ReadMoreTab() {
  const [open, setOpen] = useState(false);

  return (
    <article className="bg-surface border-border max-w-md rounded-lg border p-5">
      <h3 className="text-fg text-base font-semibold">
        Why design tokens matter
      </h3>
      <p className="text-muted mt-2 text-sm">
        Design tokens are named values for color, spacing, and typography that
        keep a product visually consistent. Instead of hardcoding a hex value in
        fifty places, components reference a single token.
      </p>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleContent className="text-muted flex flex-col gap-2 text-sm">
          <p className="pt-2">
            When a brand refresh lands, you change the token once and every
            screen follows. Theming works the same way: light, dark, and any
            future theme simply remap the same token names to new values.
          </p>
          <p>
            Tokens also make review easier — a diff that says
            &quot;surface-hover&quot; communicates intent, while a raw hex value
            communicates nothing.
          </p>
        </CollapsibleContent>
        <CollapsibleTrigger className="text-brand mt-3 rounded-md text-sm font-medium hover:underline">
          {open ? "Show less" : "Read more"}
        </CollapsibleTrigger>
      </Collapsible>
    </article>
  );
}
