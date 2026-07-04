import { NextResponse } from "next/server";
import { graphqlErrorBody, graphqlFetch } from "@/lib/backend";
import { getAccessToken } from "@/store/ssr-cookies";
import { CREATE_REACTION_MUTATION } from "@/lib/graphql/queries";

export async function POST(request: Request) {
  let body: { type?: string; postId?: string; commentId?: string };
  const token = await getAccessToken();

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ statusCode: 400, exc: "EX_VALIDATION_FORM", msg: "Invalid JSON body", key: "errors.invalidJson" }, { status: 400 });
  }

  if (!body.type) {
    return NextResponse.json(
      { statusCode: 400, exc: "EX_VALIDATION_FORM", msg: "type is required (LIKE | LOVE | LAUGH | WOW | SAD | ANGRY)", key: "errors.typeRequired" },
      { status: 400 },
    );
  }

  if (!body.postId && !body.commentId) {
    return NextResponse.json(
      { statusCode: 400, exc: "EX_VALIDATION_FORM", msg: "Either postId or commentId is required", key: "errors.targetRequired" },
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
    return NextResponse.json(graphqlErrorBody(errors, "GraphQL error"));
  }

  return NextResponse.json({ reaction: data?.createReaction }, { status: 201 });
}
