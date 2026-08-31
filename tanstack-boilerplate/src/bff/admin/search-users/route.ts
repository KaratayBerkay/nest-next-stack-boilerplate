import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/cookie";
import { graphqlErrorBody, graphqlFetch } from "@/lib/backend";

// Admin-only variant of /api/users/search: also selects role/status, which
// the general search route (find-friends/users-directory) must never expose
// to a non-admin caller.
const ME_QUERY = `
  query Me {
    me { id role }
  }
`;

const SEARCH_USERS_QUERY = `
  query SearchUsers($search: String) {
    adminSearchUsers(search: $search) {
      id
      name
      email
      role
      status
      subscriptionTier
    }
  }
`;

export async function GET(request: NextRequest) {
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
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

  const meRes = await graphqlFetch<{ me: { id: string; role: string } }>(
    ME_QUERY,
    undefined,
    accessToken,
  );
  if (
    meRes.data?.me?.role !== "ADMIN" &&
    meRes.data?.me?.role !== "SUPERADMIN"
  ) {
    return NextResponse.json(
      {
        statusCode: 403,
        exc: "EX_FORBIDDEN",
        msg: "Forbidden",
        key: "auth.errors.forbidden",
      },
      { status: 403 },
    );
  }

  const q = request.nextUrl.searchParams.get("q") || "";
  const take = Math.min(
    Math.max(
      parseInt(request.nextUrl.searchParams.get("take") || "20", 10) || 20,
      1,
    ),
    100,
  );

  const usersRes = await graphqlFetch<{
    adminSearchUsers: {
      id: string;
      name: string;
      email: string;
      role: string;
      status: string;
      subscriptionTier: string;
    }[];
  }>(SEARCH_USERS_QUERY, { search: q }, accessToken);

  if (usersRes.errors || !usersRes.data) {
    const body = graphqlErrorBody(usersRes.errors, "Failed to search users");
    return NextResponse.json(body, { status: body.statusCode });
  }

  const currentUserId = meRes.data?.me?.id;
  const items = usersRes.data.adminSearchUsers
    .filter((u) => u.id !== currentUserId)
    .slice(0, take);

  return NextResponse.json({ items });
}
