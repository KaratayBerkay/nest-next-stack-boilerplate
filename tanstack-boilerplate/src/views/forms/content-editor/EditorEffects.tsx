"use client";

import { useEffect, useRef } from "react";
import type { EditorEffectsProps } from "@/types/views/forms/EditorEffects-types";
import { deriveSlug, saveDraft, clearDraft } from "./draft-utils";

export function EditorEffects({
  draftKey,
  values,
  formSetFieldValue,
  dirtyRef,
  slugEditedByUser,
}: EditorEffectsProps) {
  useEffect(() => {
    if (values.title && !slugEditedByUser.current) {
      const derived = deriveSlug(values.title);
      formSetFieldValue("slug", derived);
    }
  }, [values.title, formSetFieldValue, slugEditedByUser]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirtyRef]);

  useEffect(() => {
    const handler = () => clearDraft(draftKey);
    window.addEventListener("auth:logout", handler);
    return () => window.removeEventListener("auth:logout", handler);
  }, [draftKey]);

  // `values` changes on every keystroke — depending on it here meant the
  // interval was torn down and restarted before it ever reached 30s, so
  // autosave only ever fired after 30s of uninterrupted idle. The interval
  // is now set up once per draftKey; valuesRef gets it the latest content
  // without resetting the timer.
  const valuesRef = useRef(values);
  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  useEffect(() => {
    const handler = () => {
      const current = valuesRef.current;
      if (draftKey && current.title) {
        saveDraft(draftKey, {
          title: current.title,
          slug: current.slug,
          tags: current.tags,
          body: current.body,
        });
      }
    };
    const interval = setInterval(handler, 30000);
    return () => clearInterval(interval);
  }, [draftKey]);

  return null;
}
