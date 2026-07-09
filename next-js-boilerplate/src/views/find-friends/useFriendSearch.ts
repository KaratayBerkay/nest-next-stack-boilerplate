import { useState, useEffect, useReducer, useRef, useCallback } from "react";
import { apiFetch } from "@/lib/api-client";
import { USERS_SEARCH_PREFIX } from "@/constants/api/urls";
import { searchReducer, PAGE_SIZE, type User } from "./search-utils";

export function useFriendSearch(currentUserId?: string) {
  const [search, dispatch] = useReducer(searchReducer, {
    items: [],
    total: 0,
    page: 0,
  });
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const totalPages = Math.ceil(search.total / PAGE_SIZE);

  const doSearch = useCallback((q: string, p: number) => {
    const trimmed = q.trim();
    if (trimmed.length < 3) {
      dispatch({ type: "clear" });
      return;
    }
    const skip = p * PAGE_SIZE;
    setSearching(true);
    apiFetch(
      `${USERS_SEARCH_PREFIX}?q=${encodeURIComponent(trimmed)}&take=${PAGE_SIZE}&skip=${skip}`,
    )
      .then((res) => (res.ok ? res.json() : { items: [], total: 0 }))
      .then((data) =>
        dispatch({ type: "results", items: data.items, total: data.total }),
      )
      .catch(() => dispatch({ type: "results", items: [], total: 0 }))
      .finally(() => setSearching(false));
  }, []);

  const onQueryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const q = e.target.value;
      setQuery(q);
      if (q.trim().length < 3) {
        dispatch({ type: "clear" });
        return;
      }
      dispatch({ type: "page", page: 0 });
      if (searchTimer.current) clearTimeout(searchTimer.current);
      searchTimer.current = setTimeout(() => doSearch(q, 0), 300);
    },
    [doSearch],
  );

  useEffect(() => {
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, []);

  const filtered = search.items.filter((u) => {
    if (u.id === currentUserId) return false;
    return true;
  });

  return {
    search,
    dispatch,
    query,
    setQuery,
    searching,
    filtered,
    totalPages,
    onQueryChange,
    doSearch,
  };
}
