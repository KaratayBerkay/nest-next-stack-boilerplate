import { NextResponse } from "next/server";
import { graphqlErrorBody, graphqlFetch } from "@/lib/backend";
import { getAccessToken } from "@/store/ssr-cookies";
import {
  UPDATE_COMMENT_MUTATION,
  DELETE_COMMENT_MUTATION,
} from "@/lib/graphql/queries";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = await getAccessToken();

  let body: { body?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ statusCode: 400, exc: "EX_VALIDATION_FORM", msg: "Invalid JSON body", key: "errors.invalidJson" }, { status: 400 });
  }

  if (!body.body?.trim()) {
    return NextResponse.json({ statusCode: 400, exc: "EX_VALIDATION_FORM", msg: "Body is required", key: "errors.bodyRequired" }, { status: 400 });
  }

  const { data, errors } = await graphqlFetch<{
    updateComment: { id: string; body: string };
  }>(UPDATE_COMMENT_MUTATION, { id, data: { body: body.body } }, token);

  if (errors) {
    const body = graphqlErrorBody(errors, "GraphQL error");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json({ comment: data?.updateComment });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = await getAccessToken();

  const { data, errors } = await graphqlFetch<{
    deleteComment: { id: string };
  }>(DELETE_COMMENT_MUTATION, { id }, token);

  if (errors) {
    const body = graphqlErrorBody(errors, "GraphQL error");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json({ comment: data?.deleteComment });
}
