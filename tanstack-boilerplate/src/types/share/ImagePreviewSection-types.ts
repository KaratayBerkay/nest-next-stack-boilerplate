import type { Dispatch, SetStateAction, RefObject } from "react";
import type { I18nMessages } from "@/generated/i18n-messages";

export interface ImagePreviewSectionProps {
  preview: string | null;
  uploading: boolean;
  uploadError: boolean;
  coverImageRef: React.MutableRefObject<string | undefined>;
  fileRef: RefObject<HTMLInputElement | null>;
  setFile: Dispatch<SetStateAction<File | null>>;
  setPreview: Dispatch<SetStateAction<string | null>>;
  setUploadError: Dispatch<SetStateAction<boolean>>;
  t: I18nMessages["share"];
}
