import { Controller } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  NatsContext,
  Payload,
} from '@nestjs/microservices';

/**
 * NATS-only: the docs' subject wildcard. NATS subjects are dot-delimited tokens and `*` matches
 * exactly one token, so a subscription to `time.*` answers requests sent to `time.us`, `time.eu`,
 * … The transport-specific `@Ctx() NatsContext` exposes the concrete subject the request actually
 * arrived on. Lives in its own controller (not the shared one) because `*` is illegal in a Kafka
 * topic name, and Redis/MQTT/RMQ don't wildcard-match this subject anyway.
 */
@Controller()
export class NatsWildcardController {
  @MessagePattern('time.*')
  getTime(
    @Payload() _data: unknown,
    @Ctx() context: NatsContext,
  ): { subject: string } {
    return { subject: context.getSubject() };
  }
}
