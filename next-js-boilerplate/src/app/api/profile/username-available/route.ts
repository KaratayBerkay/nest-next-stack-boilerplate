import { NextRequest, NextResponse } from "next/server";
import { graphqlFetch, graphqlErrorBody } from "@/lib/backend";
import { getAccessToken } from "@/store/ssr-cookies";

const USERNAME_AVAILABLE_QUERY = `
  query IsUsernameAvailable($username: String!) {
    isUsernameAvailable(username: $username)
  }
`;

export async function GET(request: NextRequest) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ available: false }, { status: 200 });
  }

  const username = request.nextUrl.searchParams.get("u");
  if (!username || username.length < 3) {
    return NextResponse.json({ available: false }, { status: 200 });
  }

  const { data, errors } = await graphqlFetch<{
    isUsernameAvailable: boolean;
  }>(USERNAME_AVAILABLE_QUERY, { username }, accessToken);

  if (errors) {
    const body = graphqlErrorBody(errors, "Failed to check username");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json({ available: data?.isUsernameAvailable ?? false });
}
