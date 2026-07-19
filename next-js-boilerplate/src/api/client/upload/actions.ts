import { useCallback } from "react";

export function useUploadActions() {
  const uploadWithProgress = useCallback(
    async (file: File, onProgress?: (pct: number) => void) => {
      const { uploadSingleWithProgress } = await import("@/api/server/upload/xhr-single");
      return uploadSingleWithProgress(file, onProgress);
    },
    [],
  );

  return { uploadWithProgress };
}
