"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMessageUpload } from "@/api/client/messages/actions";
import type { UploadItem } from "@/types/messages/AttachmentModal-types";
import type { MessageAttachment } from "@/types/messages/MessageAttachment-types";

const MAX_UPLOADS = 10;

function applyItemUpdate(
  items: UploadItem[],
  id: string,
  update: (item: UploadItem) => UploadItem,
): UploadItem[] {
  return items.map((it) => (it.id === id ? update(it) : it));
}

/**
 * Multi-file upload state shared by the chat room and DM composers.
 * Files upload in parallel over the streaming endpoint; each one reports
 * real byte-level progress from the XHR transport. Items are keyed by id so
 * per-file cancellation (abort) and removal work independently.
 */
export function useAttachmentUploads() {
  const { uploadAttachment } = useMessageUpload();
  const [items, setItems] = useState<UploadItem[]>([]);
  const controllersRef = useRef(new Map<string, AbortController>());
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const startUploads = useCallback(
    (files: File[]) => {
      if (files.length === 0) return;
      const slots = Math.max(MAX_UPLOADS - itemsRef.current.length, 0);
      const accepted = files.slice(0, slots);
      if (accepted.length === 0) return;

      const newItems: UploadItem[] = accepted.map((file) => ({
        id: crypto.randomUUID(),
        file,
        progress: 0,
        status: "uploading",
      }));
      setItems((prev) => [...prev, ...newItems]);

      for (const item of newItems) {
        const controller = new AbortController();
        controllersRef.current.set(item.id, controller);
        void uploadAttachment(item.file, {
          onProgress: (percent) =>
            setItems((prev) =>
              applyItemUpdate(prev, item.id, (it) => ({
                ...it,
                progress: percent,
              })),
            ),
          signal: controller.signal,
        })
          .then((attachment) => {
            controllersRef.current.delete(item.id);
            setItems((prev) =>
              applyItemUpdate(prev, item.id, (it) => ({
                ...it,
                status: "done",
                progress: 100,
                attachment,
              })),
            );
          })
          .catch((err: unknown) => {
            controllersRef.current.delete(item.id);
            if (err instanceof DOMException && err.name === "AbortError") {
              setItems((prev) => prev.filter((it) => it.id !== item.id));
              return;
            }
            setItems((prev) =>
              applyItemUpdate(prev, item.id, (it) => ({
                ...it,
                status: "error",
              })),
            );
          });
      }
    },
    [uploadAttachment],
  );

  const removeItem = useCallback((id: string) => {
    controllersRef.current.get(id)?.abort();
    controllersRef.current.delete(id);
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, []);

  const cancelAll = useCallback(() => {
    for (const controller of controllersRef.current.values())
      controller.abort();
    controllersRef.current.clear();
    setItems([]);
  }, []);

  const clear = useCallback(() => {
    controllersRef.current.clear();
    setItems([]);
  }, []);

  const doneAttachments = useCallback((): MessageAttachment[] => {
    const ready: MessageAttachment[] = [];
    for (const it of itemsRef.current) {
      if (it.status === "done" && it.attachment) ready.push(it.attachment);
    }
    return ready;
  }, []);

  const anyUploading = items.some((it) => it.status === "uploading");
  const allDone = items.length > 0 && items.every((it) => it.status === "done");

  return {
    items,
    startUploads,
    removeItem,
    cancelAll,
    clear,
    doneAttachments,
    anyUploading,
    allDone,
  };
}
