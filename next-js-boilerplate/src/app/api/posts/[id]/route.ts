import { NextResponse } from "next/server";
import { graphqlErrorStatus, graphqlFetch } from "@/lib/backend";
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
    return NextResponse.json({ error: errors[0].message }, { status: graphqlErrorStatus(errors) });
  }

  if (!data?.post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json({ post: data.post });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = await getAccessToken();

  let body: {
    title?: string;
    content?: string;
    coverImage?: string;
    imageUrl?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.title && !body.content && body.coverImage === undefined) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { data, errors } = await graphqlFetch<{
    updatePost: { id: string; title: string; content: string };
  }>(UPDATE_POST_MUTATION, { id, data: body }, token);

  if (errors) {
    const status = errors[0]?.extensions?.code === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: errors[0].message }, { status });
  }

  return NextResponse.json({ post: data?.updatePost });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = await getAccessToken();

  const { data, errors } = await graphqlFetch<{
    deletePost: { id: string };
  }>(DELETE_POST_MUTATION, { id }, token);

  if (errors) {
    const status = errors[0]?.extensions?.code === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: errors[0].message }, { status });
  }

  return NextResponse.json({ post: data?.deletePost });
}
