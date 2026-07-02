import { AuditAction, LogLevel } from '@prisma/client';

// The canonical shape we persist into OutboxEvent.payload and later fan out to AuditLog
// (and Elasticsearch). Every state-changing operation describes itself as one of these,
// written in the SAME transaction as the change — never logged inline from a handler.
export interface DomainEvent {
  /** Aggregate the event is about, e.g. "User", "Session". Maps to AuditLog.entityType. */
  aggregateType: string;
  /** Aggregate id. Maps to AuditLog.entityId. */
  aggregateId: string;
  /** Dotted event name, e.g. "user.signup", "auth.login.failed". */
  eventType: string;
  action: AuditAction;
  level?: LogLevel;
  actorId?: string | null;
  organizationId?: string | null;
  summary?: string | null;
  before?: unknown;
  after?: unknown;
  ip?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
  correlationId?: string | null;
}
