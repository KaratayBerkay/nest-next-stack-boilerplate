export interface AuditActor {
  id: string;
  name: string;
  email: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  level: string;
  entityType: string;
  entityId: string | null;
  summary: string | null;
  ip: string | null;
  userAgent: string | null;
  requestId: string | null;
  correlationId: string | null;
  createdAt: string;
  before: unknown | null;
  after: unknown | null;
  actor: AuditActor | null;
}

export interface AuditLogResponse {
  items: AuditLogEntry[];
  total: number;
  take: number;
  skip: number;
}
