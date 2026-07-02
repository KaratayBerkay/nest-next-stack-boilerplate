import {
  Controller,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RpcException,
  TcpContext,
} from '@nestjs/microservices';
import { from } from 'rxjs';
import type { Observable } from 'rxjs';
import { AllRpcExceptionsFilter } from './all-exceptions.filter';
import { CreateOrderDto } from './dto/create-order.dto';
import { EventLogService } from './event-log.service';
import { CustomRpcExceptionFilter } from './rpc-exception.filter';
import { RpcAuthGuard } from './rpc-auth.guard';
import { RpcTransformInterceptor } from './rpc-transform.interceptor';

/**
 * Microservices entry point (TCP transport). A `@Controller()` is the documented home for
 * `@MessagePattern` (request-response) and `@EventPattern` (event-based) handlers — providers
 * are ignored by the runtime. One controller proves the Overview (#74) plus every enhancer:
 * exception filters (#82), pipes (#83), guards (#84) and interceptors (#85). Each handler is
 * scoped to its own pattern so the e2e can drive them independently over a real `ClientProxy`.
 */
@Controller()
export class MicroservicesController {
  constructor(private readonly eventLog: EventLogService) {}

  // #74 Request-response: the canonical docs example. Returns synchronously.
  @MessagePattern({ cmd: 'sum' })
  accumulate(@Payload() data: number[]): number {
    return (data || []).reduce((a, b) => a + b, 0);
  }

  // #74 Request-response, Observable: emits each value as a separate response. Also reads the
  // transport-specific `TcpContext` via `@Ctx()` (the "additional request details" pattern).
  @MessagePattern({ cmd: 'stream' })
  stream(
    @Payload() data: number[],
    @Ctx() context: TcpContext,
  ): Observable<number> {
    // Touch the context so the @Ctx() wiring is exercised (pattern is a string/object).
    void context.getPattern();
    return from(data);
  }

  // #74 Event-based: fire-and-forget. Records receipt so a request-response query can prove it.
  @EventPattern('order.created')
  handleOrderCreated(@Payload() data: Record<string, unknown>): void {
    this.eventLog.record('order.created', data);
  }

  // Reads back what the event handler recorded (request-response).
  @MessagePattern({ cmd: 'events' })
  events(): Array<{ pattern: string; payload: unknown }> {
    return this.eventLog.all();
  }

  // #82 Default filter: a thrown RpcException(string) is surfaced by the framework's default
  // filter as `{ status: 'error', message }` on the client's send() observable.
  @MessagePattern({ cmd: 'throw-rpc' })
  throwRpc(): never {
    throw new RpcException('Invalid credentials.');
  }

  // #82 Custom filter: reshapes the error onto a bespoke `{ code, detail }` envelope.
  @UseFilters(new CustomRpcExceptionFilter())
  @MessagePattern({ cmd: 'throw-custom' })
  throwCustom(): never {
    throw new RpcException('boom');
  }

  // #82 Inheritance: a plain (non-Rpc) Error delegated to BaseRpcExceptionFilter →
  // `{ status: 'error', message: 'Internal server error' }`.
  @UseFilters(new AllRpcExceptionsFilter())
  @MessagePattern({ cmd: 'throw-unknown' })
  throwUnknown(): never {
    throw new Error('unexpected failure');
  }

  // #83 Pipes: ValidationPipe with an `exceptionFactory` that throws RpcException. Valid data
  // flows to the handler; invalid data makes the factory throw, delivering the ValidationError
  // array on the client's error channel.
  @UsePipes(
    new ValidationPipe({
      exceptionFactory: (errors) => new RpcException(errors),
    }),
  )
  @MessagePattern({ cmd: 'create-order' })
  createOrder(@Payload() dto: CreateOrderDto): { created: CreateOrderDto } {
    return { created: dto };
  }

  // #84 Guards: RpcAuthGuard reads the token from the payload. No token → RpcException
  // ('Forbidden resource'). Class-referenced, so it's resolved from the DI container.
  @UseGuards(RpcAuthGuard)
  @MessagePattern({ cmd: 'secure' })
  secure(): { secured: boolean } {
    return { secured: true };
  }

  // #85 Interceptors: the same map → `{ data }` envelope as over HTTP, wrapping the result.
  @UseInterceptors(new RpcTransformInterceptor())
  @MessagePattern({ cmd: 'transform' })
  transform(@Payload() data: { value: number }): { value: number } {
    return { value: data.value };
  }
}
