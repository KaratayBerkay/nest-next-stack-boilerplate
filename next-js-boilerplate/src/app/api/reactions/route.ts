import { NextResponse } from "next/server";
import { graphqlErrorStatus, graphqlFetch } from "@/lib/backend";
import { getAccessToken } from "@/store/ssr-cookies";
import { CREATE_REACTION_MUTATION } from "@/lib/graphql/queries";

export async function POST(request: Request) {
  let body: { type?: string; postId?: string; commentId?: string };
  const token = await getAccessToken();

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.type) {
    return NextResponse.json(
      { error: "type is required (LIKE | LOVE | LAUGH | WOW | SAD | ANGRY)" },
      { status: 400 },
    );
  }

  if (!body.postId && !body.commentId) {
    return NextResponse.json(
      { error: "Either postId or commentId is required" },
      { status: 400 },
    );
  }

  const { data, errors } = await graphqlFetch<{
    createReaction: { id: string; type: string; userId: string };
  }>(
    CREATE_REACTION_MUTATION,
    {
      data: {
        type: body.type,
        ...(body.postId ? { postId: body.postId } : {}),
        ...(body.commentId ? { commentId: body.commentId } : {}),
      },
    },
    token,
  );

  if (errors) {
    return NextResponse.json({ error: errors[0]?.message ?? "GraphQL error" }, { status: graphqlErrorStatus(errors) });
  }

  return NextResponse.json({ reaction: data?.createReaction }, { status: 201 });
}
