import { ME_ID_QUERY } from "@/lib/graphql/queries";
import { graphqlErrorBody, graphqlFetch } from "@/lib/backend";

const SEARCH_USERS_QUERY = `
  query SearchUsers($search: String) {
    users(search: $search) {
      id
      name
      email
    }
  }
`;

export interface UserSearchResult {
  items: Array<{ id: string; name: string; email: string }>;
  total: number;
}

export async function searchUsersServer(
  q: string,
  take: number,
  skip: number,
  accessToken: string,
): Promise<UserSearchResult> {
  const [meRes, usersRes] = await Promise.all([
    graphqlFetch<{ me: { id: string } }>(ME_ID_QUERY, undefined, accessToken),
    graphqlFetch<{
      users: Array<{ id: string; name: string; email: string }>;
    }>(SEARCH_USERS_QUERY, { search: q }, accessToken),
  ]);

  if (usersRes.errors || !usersRes.data) {
    const body = graphqlErrorBody(usersRes.errors, "Failed to search users");
    throw new Error(body.msg);
  }

  const currentUserId = meRes.data?.me?.id;
  const allUsers = currentUserId
    ? usersRes.data.users.filter((u) => u.id !== currentUserId)
    : usersRes.data.users;
  const total = allUsers.length;
  const items = allUsers.slice(skip, skip + take);

  return { items, total };
}
