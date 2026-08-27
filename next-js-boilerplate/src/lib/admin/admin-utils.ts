import type { Dispatch, SetStateAction, MutableRefObject } from "react";
import { searchAdminUsersServer } from "@/api/server/admin/search-users";
import type { AdminUserResult } from "@/api/server/admin/search-users";
import { setTierServer } from "@/api/server/admin/set-tier";
import { setStatusServer } from "@/api/server/admin/set-status";
import { resetMfaServer } from "@/api/server/admin/reset-mfa";
import type { I18nMessages } from "@/generated/i18n-messages";

export type UserResult = AdminUserResult;

export async function doSearch(
  q: string,
  setResults: Dispatch<SetStateAction<UserResult[]>>,
  setSearching: Dispatch<SetStateAction<boolean>>,
  requestId: MutableRefObject<number>,
) {
  // Bumped before the request starts and re-checked after it resolves — if
  // a newer search has started in the meantime, this response is stale and
  // must not overwrite (or blank out the loading state for) the current
  // one. Without this, an earlier query's response arriving after a later
  // one's could silently replace correct, current-query results with
  // results for whatever the admin searched for a moment ago — and since
  // suspend/ban/tier actions act on the row currently on screen, that's a
  // real risk of an admin acting on a different user than intended.
  const myRequestId = ++requestId.current;
  if (q.trim().length < 2) {
    setResults([]);
    return;
  }
  setSearching(true);
  try {
    const items = await searchAdminUsersServer(q);
    if (requestId.current !== myRequestId) return;
    setResults(items);
  } catch {
    if (requestId.current !== myRequestId) return;
    setResults([]);
  } finally {
    if (requestId.current === myRequestId) setSearching(false);
  }
}

export function onQueryChange(
  e: React.ChangeEvent<HTMLInputElement>,
  setQuery: Dispatch<SetStateAction<string>>,
  setResults: Dispatch<SetStateAction<UserResult[]>>,
  setSearching: Dispatch<SetStateAction<boolean>>,
  searchTimer: MutableRefObject<ReturnType<typeof setTimeout> | undefined>,
  requestId: MutableRefObject<number>,
) {
  const q = e.target.value;
  setQuery(q);
  if (searchTimer.current) clearTimeout(searchTimer.current);
  searchTimer.current = setTimeout(
    () => doSearch(q, setResults, setSearching, requestId),
    300,
  );
}

type StatusMsgSetter = Dispatch<
  SetStateAction<{ type: "success" | "error"; text: string } | null>
>;

export async function setTier(
  userId: string,
  tier: string,
  setStatusMsg: StatusMsgSetter,
  onDone: (tier: string) => void,
  t: I18nMessages["admin"],
) {
  setStatusMsg(null);
  try {
    const result = await setTierServer(userId, tier);
    if (result.success) {
      setStatusMsg({ type: "success", text: t.tierUpdated });
      // Previously the row never learned the change succeeded — its "current
      // tier" badge/select stayed on the pre-change value until the admin
      // re-ran the search, unlike the identical setUserStatus flow right
      // below, which already refreshes its row on success.
      onDone(tier);
    } else {
      setStatusMsg({
        type: "error",
        text: result.notPermitted
          ? t.notPermittedForUser
          : (result.error ?? t.tierUpdateFailed),
      });
    }
  } catch {
    setStatusMsg({ type: "error", text: t.networkError });
  }
}

export async function setUserStatus(
  userId: string,
  status: string,
  setStatusMsg: StatusMsgSetter,
  onDone: () => void,
  t: I18nMessages["admin"],
) {
  setStatusMsg(null);
  try {
    const result = await setStatusServer(userId, status);
    if (result.success) {
      setStatusMsg({ type: "success", text: t.statusUpdated });
      onDone();
    } else {
      setStatusMsg({
        type: "error",
        text: result.notPermitted
          ? t.notPermittedForUser
          : (result.error ?? t.statusUpdateFailed),
      });
    }
  } catch {
    setStatusMsg({ type: "error", text: t.networkError });
  }
}

export async function resetUserMfa(
  userId: string,
  setStatusMsg: StatusMsgSetter,
  t: I18nMessages["admin"],
) {
  setStatusMsg(null);
  try {
    const result = await resetMfaServer(userId);
    if (result.success) {
      setStatusMsg({ type: "success", text: t.mfaResetSuccess });
    } else {
      setStatusMsg({
        type: "error",
        text: result.notPermitted
          ? t.notPermittedForUser
          : (result.error ?? t.mfaResetFailed),
      });
    }
  } catch {
    setStatusMsg({ type: "error", text: t.networkError });
  }
}
