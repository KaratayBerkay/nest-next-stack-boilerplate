export type User = { id: string; name: string };

export type FriendRequest = {
  id: string;
  direction: "incoming" | "outgoing";
  user: User;
};

export const PAGE_SIZE = 10;

export interface SearchState {
  items: User[];
  total: number;
  page: number;
}

export type SearchAction =
  | { type: "results"; items: User[]; total: number }
  | { type: "page"; page: number }
  | { type: "clear" };

export function searchReducer(
  state: SearchState,
  action: SearchAction,
): SearchState {
  switch (action.type) {
    case "results":
      return { ...state, items: action.items, total: action.total };
    case "page":
      return { ...state, page: action.page };
    case "clear":
      return { items: [], total: 0, page: 0 };
  }
}

export function goToPage(
  p: number,
  dispatch: React.Dispatch<SearchAction>,
  query: string,
  doSearch: (q: string, p: number) => void,
) {
  dispatch({ type: "page", page: p });
  doSearch(query.trim(), p);
}
