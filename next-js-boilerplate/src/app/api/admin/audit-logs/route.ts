import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/cookie";
import { graphqlFetch, graphqlErrorBody } from "@/lib/backend";

const AUDIT_LOGS_QUERY = `
  query AuditLogs($where: AuditLogWhereInput, $orderBy: [AuditLogOrderByWithRelationInput!], $take: Int, $skip: Int) {
    auditLogs(where: $where, orderBy: $orderBy, take: $take, skip: $skip) {
      id
      action
      level
      entityType
      entityId
      summary
      ip
      userAgent
      requestId
      correlationId
      createdAt
      before
      after
      actor { id name email }
    }
  }
`;

const AUDIT_LOG_COUNT_QUERY = `
  query AuditLogCount($where: AuditLogWhereInput) {
    auditLogCount(where: $where)
  }
`;

export async function GET(request: NextRequest) {
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json(
      {
        statusCode: 401,
        exc: "EX_AUTH_INVALID_CREDENTIALS",
        msg: "Unauthorized",
        key: "auth.errors.unauthorized",
      },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const take = Math.min(Number(searchParams.get("take")) || 50, 100);
  const skip = Number(searchParams.get("skip")) || 0;
  const action = searchParams.get("action") || undefined;
  const level = searchParams.get("level") || undefined;
  const entityType = searchParams.get("entityType") || undefined;
  const actorId = searchParams.get("actorId") || undefined;

  const where: Record<string, unknown> = {};
  if (action) where.action = { equals: action };
  if (level) where.level = { equals: level };
  if (entityType) where.entityType = { contains: entityType };
  if (actorId) where.actorId = { equals: actorId };

  const { data, errors } = await graphqlFetch<{
    auditLogs: unknown[];
    auditLogCount: number;
  }>(
    `${AUDIT_LOGS_QUERY}\n${AUDIT_LOG_COUNT_QUERY}`,
    { where: Object.keys(where).length ? where : undefined, take, skip },
    accessToken,
  );

  if (errors) {
    const body = graphqlErrorBody(errors, "Failed to load audit logs");
    return NextResponse.json(body, { status: body.statusCode });
  }

  return NextResponse.json({
    items: data?.auditLogs ?? [],
    total: data?.auditLogCount ?? 0,
    take,
    skip,
  });
}
