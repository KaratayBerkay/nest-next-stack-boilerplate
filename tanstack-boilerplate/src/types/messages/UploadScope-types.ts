export type UploadScopeKind = "messages" | "chat-room";

export interface UploadScope {
  kind: UploadScopeKind;
  id: string;
}
