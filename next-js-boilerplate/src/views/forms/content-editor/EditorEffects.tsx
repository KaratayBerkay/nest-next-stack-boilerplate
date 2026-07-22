"use client";

import { useEffect } from "react";
import type { DraftValues } from "./draft-utils";
import { deriveSlug, saveDraft, clearDraft } from "./draft-utils";

interface EditorEffectsProps {
  draftKey: string;
  values: DraftValues;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formSetFieldValue: any;
  dirtyRef: React.MutableRefObject<boolean>;
  slugEditedByUser: React.MutableRefObject<boolean>;
}

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

  useEffect(() => {
    const handler = () => {
      if (draftKey && values.title) {
        saveDraft(draftKey, {
          title: values.title,
          slug: values.slug,
          tags: values.tags,
          body: values.body,
        });
      }
    };
    const interval = setInterval(handler, 30000);
    return () => clearInterval(interval);
  }, [draftKey, values]);

  return null;
}
