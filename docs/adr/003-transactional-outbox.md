# ADR 003: Transactional outbox for audit logging and events

**Status:** Accepted (implemented Phase 16)

## Context

The application needs reliable event emission for:
- Audit logging (login, signup, password change, tier change)
- Notifications (WebSocket push, email, push notification)
- Kafka frontend events
- Elasticsearch indexing

Direct event emission from business logic creates consistency problems: if the event
fails after the database write succeeds, the system is in an inconsistent state. If
the event succeeds before the database write commits, downstream consumers see phantom
events on rollback.

## Decision

Use the **transactional outbox pattern**:

1. Business logic writes an `OutboxEvent` row **inside the same database transaction**
   as the domain change
2. A background poller (`OutboxService.relayPendingEvents()`) periodically claims
   pending events with `SELECT ... FOR UPDATE SKIP LOCKED`
3. Each claimed event is published to the appropriate channel (BullMQ queue, Kafka
   topic, direct WebSocket push)
4. On successful publish, the event is marked as `PUBLISHED`
5. Failed events are retried with exponential backoff (max 5 attempts)

```
Domain change + OutboxEvent write (in $transaction)
  → Poller picks up pending events (every 2s by default)
  → Publishes to BullMQ → Workers fan out to Kafka, ES, WebSocket, email
```

## Consequences

- **Positive:** At-least-once delivery guarantee — events survive partial failures
- **Positive:** Clear separation between domain logic and side effects
- **Positive:** The outbox table doubles as an audit trail (events link to aggregates)
- **Negative:** Increased latency between domain change and event delivery (polling
  interval + queue processing)
- **Negative:** The outbox table grows unbounded without a retention policy
- **Negative:** Event schemas evolve separately from domain schemas (versioning needed)

## When to deviate

- For apps that don't need audit trails or async side effects, skip entirely
- For single-process apps, in-process EventEmitter is simpler and synchronous
- For high-throughput systems, use Kafka Connect Debezium (CDC) instead of polling
