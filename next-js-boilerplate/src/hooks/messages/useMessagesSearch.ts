"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { searchUsersQueryOptions } from "@/api/client/users/search";
import { useQuery } from "@tanstack/react-query";
import type { UserInfo } from "@/types/messages/FreePageView-types";

export function useMessagesSearch(userId: string | undefined) {
  const [search, setSearch] = useState("");
  const [findInput, setFindInput] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sentRequestIds, setSentRequestIds] = useState<Set<string>>(new Set());

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debouncedSearch = useCallback((val: string) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => setDebouncedQuery(val), 300);
  }, []);

  const { data: searchData } = useQuery({
    ...searchUsersQueryOptions(debouncedQuery, 20, 0),
    enabled: debouncedQuery.trim().length >= 1 && !!userId,
  });
  const findResults = useMemo(
    () => (searchData?.items ?? []) as UserInfo[],
    [searchData],
  );

  return {
    search,
    setSearch,
    findInput,
    setFindInput,
    findResults,
    sentRequestIds,
    setSentRequestIds,
    debouncedSearch,
  };
}
