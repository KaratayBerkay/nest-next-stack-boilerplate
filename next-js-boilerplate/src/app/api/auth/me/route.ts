import { NextResponse } from "next/server";
import { graphqlFetch } from "@/lib/backend";
import { ME_QUERY } from "@/lib/graphql/queries";
import { getAccessToken } from "@/store/ssr-cookies";

export async function GET() {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const { data, errors } = await graphqlFetch<{ me: unknown }>(
    ME_QUERY,
    undefined,
    accessToken,
  );

  if (errors || !data?.me) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  return NextResponse.json({ user: data.me, accessToken }, { status: 200 });
}
