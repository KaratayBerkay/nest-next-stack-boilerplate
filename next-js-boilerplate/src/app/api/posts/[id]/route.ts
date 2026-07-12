import { NextResponse } from "next/server";
import { csrfEchoHeaders, graphqlErrorBody, graphqlFetch } from "@/lib/backend";
import { getAccessToken } from "@/store/ssr-cookies";
import {
  POST_QUERY,
  UPDATE_POST_MUTATION,
  DELETE_POST_MUTATION,
} from "@/lib/graphql/queries";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = await getAccessToken();

  const { data, errors } = await graphqlFetch<{
    post: unknown;
  }>(POST_QUERY, { id }, token);

  if (errors) {
    const body = graphqlErrorBody(errors, "GraphQL error");
    return NextResponse.json(body, { status: body.statusCode });
  }

  if (!data?.post) {
    return NextResponse.json(
      {
        statusCode: 404,
        exc: "EX_NOT_FOUND",
        msg: "Post not found",
        key: "errors.notFound",
      },
      { status: 404 },
    );
  }

  return NextResponse.json({ post: data.post });
}

async function mutationHeaders() {
  const extraHeaders = await csrfEchoHeaders();
  if (!extraHeaders) {
    return {
      error: NextResponse.json(
        {
          statusCode: 403,
          exc: "EX_FORBIDDEN",
          msg: "Invalid or missing CSRF token",
          key: "errors.csrf",
        },
        { status: 403 },
      ),
    };
  }
  return { extraHeaders };
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = await getAccessToken();

  const mh = await mutationHeaders();
  if ("error" in mh) return mh.error;

  let body: {
    title?: string;
    content?: string;
    coverImage?: string;
    imageUrl?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        statusCode: 400,
        exc: "EX_VALIDATION_FORM",
        msg: "Invalid JSON body",
        key: "errors.invalidJson",
      },
      { status: 400 },
    );
  }

  if (!body.title && !body.content && body.coverImage === undefined) {
    return NextResponse.json(
      {
        statusCode: 400,
        exc: "EX_VALIDATION_FORM",
        msg: "Nothing to update",
        key: "errors.nothingToUpdate",
      },
      { status: 400 },
    );
  }

  const { data, errors } = await graphqlFetch<{
    updatePost: { id: string; title: string; content: string };
  }>(UPDATE_POST_MUTATION, { id, data: body }, token, mh.extraHeaders);

  if (errors) {
    const body = graphqlErrorBody(errors, "GraphQL error");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json({ post: data?.updatePost });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = await getAccessToken();

  const mh = await mutationHeaders();
  if ("error" in mh) return mh.error;

  const { data, errors } = await graphqlFetch<{
    deletePost: { id: string };
  }>(DELETE_POST_MUTATION, { id }, token, mh.extraHeaders);

  if (errors) {
    const body = graphqlErrorBody(errors, "GraphQL error");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json({ post: data?.deletePost });
}
