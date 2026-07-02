import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, MqttContext, Payload } from '@nestjs/microservices';
import { EventLogService } from './event-log.service';

/**
 * MQTT-only: the docs' topic wildcards. MQTT topics are `/`-delimited levels; `+` is a
 * single-level wildcard, so a subscription to `sensors/+/temperature` receives publishes to
 * `sensors/livingroom/temperature`, `sensors/kitchen/temperature`, … The `@Ctx() MqttContext`
 * exposes the concrete topic. Own controller (not the shared one) because `/` and `+` are illegal
 * in Kafka topic names.
 */
@Controller()
export class MqttWildcardController {
  constructor(private readonly eventLog: EventLogService) {}

  @EventPattern('sensors/+/temperature')
  handleReading(
    @Payload() data: Record<string, unknown>,
    @Ctx() context: MqttContext,
  ): void {
    this.eventLog.record(context.getTopic(), data);
  }
}
