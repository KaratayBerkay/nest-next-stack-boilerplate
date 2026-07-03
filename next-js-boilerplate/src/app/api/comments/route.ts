import { NextResponse } from "next/server";
import { graphqlErrorStatus, graphqlFetch } from "@/lib/backend";
import { getAccessToken } from "@/store/ssr-cookies";
import { CREATE_COMMENT_MUTATION } from "@/lib/graphql/queries";

export async function POST(request: Request) {
  let body: { postId?: string; body?: string; parentId?: string };
  const token = await getAccessToken();

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.postId || !body.body) {
    return NextResponse.json(
      { error: "postId and body are required" },
      { status: 400 },
    );
  }

  const { data, errors } = await graphqlFetch<{
    createComment: {
      id: string;
      body: string;
      createdAt: string;
      author: { id: string; name: string; email: string };
    };
  }>(
    CREATE_COMMENT_MUTATION,
    {
      data: {
        postId: body.postId,
        body: body.body,
        ...(body.parentId ? { parentId: body.parentId } : {}),
      },
    },
    token,
  );

  if (errors) {
    return NextResponse.json({ error: errors[0].message }, { status: graphqlErrorStatus(errors) });
  }

  return NextResponse.json({ comment: data?.createComment }, { status: 201 });
}
