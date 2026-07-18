import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchUsersQueryOptions } from "@/api/client/users/search";
import { PAGE_SIZE, type User } from "./search-utils";

export function useFriendSearch(currentUserId?: string) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(0);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(0);
    }, 300);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query]);

  const skip = page * PAGE_SIZE;

  const { data, isLoading } = useQuery(
    searchUsersQueryOptions(debouncedQuery, PAGE_SIZE, skip),
  );

  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const items = (data?.items ?? []).filter((u) => u.id !== currentUserId);

  const onQueryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
    },
    [],
  );

  const goToPage = useCallback((p: number) => setPage(p), []);

  return {
    items,
    total,
    page,
    query,
    setQuery,
    searching: isLoading,
    totalPages,
    onQueryChange,
    goToPage,
  };
}
