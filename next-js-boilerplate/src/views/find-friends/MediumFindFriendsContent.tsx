"use client";

import type { FindFriendsContentProps } from "@/types/find-friends/FindFriendsContent-types";
import { FreeFindFriendsContent } from "./FreeFindFriendsContent";

/** Medium/Premium find-friends: the shared content with the suggested
 *  friends sidebar — it used to be a full copy of FreeFindFriendsContent. */
export function MediumFindFriendsContent(props: FindFriendsContentProps) {
  return <FreeFindFriendsContent {...props} showSuggestedPanel />;
}
