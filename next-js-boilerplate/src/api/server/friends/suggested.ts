import { apiFetch } from "@/lib/api-client";
import { GQL_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";

// Deliberately no `email`: suggested candidates are strangers to the caller,
// and the backend always blanks the field anyway (see SuggestedFriend in
// nest-js-boilerplate's friends.resolver.ts). Don't re-add it to the query.
export interface SuggestedFriend {
  id: string;
  name?: string;
  avatarUrl?: string;
  mutualFriends: number;
}

export async function fetchSuggestedFriendsServer(): Promise<
  SuggestedFriend[]
> {
  const res = await apiFetch(GQL_URL, {
    method: POST,
    headers: JSON_CONTENT_TYPE_HEADER,
    body: JSON.stringify({
      query: `query { suggestedFriends { id name avatarUrl mutualFriends } }`,
    }),
  });
  if (res.ok) {
    const data = await res.json();
    return data.data?.suggestedFriends ?? [];
  }
  const data = await res.json();
  throw new Error(data.error ?? "Failed to load suggested friends");
}
