import type { DraftValues } from "@/views/forms/content-editor/draft-utils";

export interface EditorEffectsProps {
  draftKey: string;
  values: DraftValues;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formSetFieldValue: any;
  dirtyRef: React.MutableRefObject<boolean>;
  slugEditedByUser: React.MutableRefObject<boolean>;
}
