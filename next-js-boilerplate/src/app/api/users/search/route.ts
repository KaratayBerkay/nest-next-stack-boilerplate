import { NextRequest, NextResponse } from "next/server";
import { graphqlFetch } from "@/lib/backend";
import { ME_ID_QUERY } from "@/lib/graphql/queries";
import { getAccessToken } from "@/store/ssr-cookies";

const SEARCH_USERS_QUERY = `
  query SearchUsers($search: String) {
    users(search: $search) {
      id
      name
      email
    }
  }
`;

export async function GET(request: NextRequest) {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = request.nextUrl.searchParams.get("q") || "";
  const take = Math.min(
    Math.max(
      parseInt(request.nextUrl.searchParams.get("take") || "10", 10) || 10,
      1,
    ),
    100,
  );
  const skip = Math.max(
    parseInt(request.nextUrl.searchParams.get("skip") || "0", 10) || 0,
    0,
  );

  const [meRes, usersRes] = await Promise.all([
    graphqlFetch<{ me: { id: string } }>(ME_ID_QUERY, undefined, accessToken),
    graphqlFetch<{
      users: { id: string; name: string; email: string }[];
    }>(SEARCH_USERS_QUERY, { search: q }, accessToken),
  ]);

  if (usersRes.errors || !usersRes.data) {
    return NextResponse.json(
      { error: usersRes.errors?.[0]?.message ?? "Failed to search users" },
      { status: 400 },
    );
  }

  const currentUserId = meRes.data?.me?.id;
  const allUsers = currentUserId
    ? usersRes.data.users.filter((u) => u.id !== currentUserId)
    : usersRes.data.users;
  const total = allUsers.length;
  const items = allUsers.slice(skip, skip + take);

  return NextResponse.json({ items, total });
}
