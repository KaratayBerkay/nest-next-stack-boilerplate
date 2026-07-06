import { NextResponse } from "next/server";
import { graphqlFetch, graphqlErrorBody } from "@/lib/backend";
import { getAccessToken } from "@/store/ssr-cookies";

const MY_PROFILE_QUERY = `
  query MyProfile {
    myProfile {
      id
      name
      username
      bio
      avatarUrl
      locale
      timezone
    }
  }
`;

export async function GET() {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const { data, errors } = await graphqlFetch<{
    myProfile: {
      id: string;
      name?: string;
      username?: string;
      bio?: string;
      avatarUrl?: string;
      locale?: string;
      timezone?: string;
    };
  }>(MY_PROFILE_QUERY, {}, accessToken);

  if (errors) {
    const body = graphqlErrorBody(errors, "Failed to load profile");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json({ user: data?.myProfile ?? null });
}
