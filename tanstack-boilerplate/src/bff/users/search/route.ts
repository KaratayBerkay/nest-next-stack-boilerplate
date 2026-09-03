import { NextRequest, NextResponse } from "next/server";
import { graphqlErrorBody, graphqlFetch } from "@/lib/backend";
import { ME_ID_QUERY } from "@/lib/graphql/queries";
import { getAccessToken } from "@/store/ssr-cookies";

// Mirrors the backend's own getUsers() hard cap (messaging-friend.service.ts)
// — items can never actually be fetched past this many matches.
const FETCH_CAP = 50;

// Deliberately does not select `email`: this query is a global directory
// search (not scoped to friends/contacts), so any authenticated caller could
// otherwise harvest real email addresses for the whole user base. The
// backend's UserPrivacyResolver now redacts `email` for non-owner/non-admin
// viewers regardless, but there's no reason for this BFF layer to even ask.
const SEARCH_USERS_QUERY = `
  query SearchUsers($search: String) {
    users(search: $search) {
      id
      name
    }
    usersCount(search: $search)
  }
`;

export async function GET(request: NextRequest) {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return NextResponse.json(
      {
        statusCode: 401,
        exc: "EX_AUTH_INVALID_CREDENTIALS",
        msg: "Unauthorized",
        key: "auth.errors.unauthorized",
      },
      { status: 401 },
    );
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
      users: { id: string; name: string }[];
      usersCount: number;
    }>(SEARCH_USERS_QUERY, { search: q }, accessToken),
  ]);

  if (usersRes.errors || !usersRes.data) {
    const body = graphqlErrorBody(usersRes.errors, "Failed to search users");
    return NextResponse.json(body, { status: body.statusCode });
  }

  const currentUserId = meRes.data?.me?.id;
  const allUsers = currentUserId
    ? usersRes.data.users.filter((u) => u.id !== currentUserId)
    : usersRes.data.users;
  const items = allUsers.slice(skip, skip + take);
  // total/pagination is capped to what's actually fetchable; `truncated` lets the UI say "there's more, refine your search" instead of silently under-reporting.
  const rawTotal = usersRes.data.usersCount;
  const total = Math.min(rawTotal, FETCH_CAP);
  const truncated = rawTotal > FETCH_CAP;

  return NextResponse.json({ items, total, truncated });
}
