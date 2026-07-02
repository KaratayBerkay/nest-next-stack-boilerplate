import { NextResponse } from "next/server";
import { graphqlFetch } from "@/lib/backend";
import { getAccessToken } from "@/store/ssr-cookies";
import { POSTS_QUERY, CREATE_POST_MUTATION } from "@/lib/graphql/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const take = Math.min(parseInt(searchParams.get("take") ?? "5", 10), 50);
  const search = searchParams.get("search") || undefined;
  const token = await getAccessToken();

  const { data, errors } = await graphqlFetch<{
    postList: Array<{ id: string }>;
  }>(POSTS_QUERY, { cursor: cursor || undefined, take, search }, token);

  if (errors) {
    return NextResponse.json({ error: errors[0].message }, { status: 500 });
  }

  const all = data?.postList ?? [];
  const hasMore = all.length > take;
  const posts = hasMore ? all.slice(0, take) : all;
  const nextCursor = hasMore ? posts[posts.length - 1]?.id : null;

  return NextResponse.json({ posts, hasMore, nextCursor });
}

export async function POST(request: Request) {
  let body: {
    title?: string;
    content?: string;
    coverImage?: string;
    imageUrl?: string;
  };
  const token = await getAccessToken();

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.title || !body.content) {
    return NextResponse.json(
      { error: "Title and content are required" },
      { status: 400 },
    );
  }

  const { data, errors } = await graphqlFetch<{
    createPost: {
      id: string;
      title: string;
      content: string;
      createdAt: string;
      author: { id: string; name: string; email: string };
    };
  }>(
    CREATE_POST_MUTATION,
    {
      data: {
        title: body.title,
        content: body.content,
        ...(body.coverImage ? { coverImage: body.coverImage } : {}),
        ...(body.imageUrl ? { imageUrl: body.imageUrl } : {}),
      },
    },
    token,
  );

  if (errors) {
    return NextResponse.json({ error: errors[0].message }, { status: 500 });
  }

  return NextResponse.json({ post: data?.createPost }, { status: 201 });
}
