import {
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WsException,
} from '@nestjs/websockets';
import type { WsResponse } from '@nestjs/websockets';
import { CreateMessageDto } from './dto/create-message.dto';
import { CustomWsExceptionFilter } from './ws-exception.filter';
import { AllWsExceptionsFilter } from './all-ws-exceptions.filter';
import { WsAuthGuard } from './ws-auth.guard';
import { WsTransformInterceptor } from './ws-transform.interceptor';

/**
 * One socket.io gateway exercising every WebSocket enhancer (#69–72): exception
 * filters, pipes, guards and interceptors. The enhancers bind exactly as their HTTP
 * counterparts do — only `WsException` (not `HttpException`) and the `switchToWs()`
 * context differ. Each handler is independently provable over a real socket.io client.
 */
@WebSocketGateway({ cors: { origin: '*' } })
export class EnhancersGateway {
  // #69 — default path: a thrown WsException is surfaced by the framework's filter
  // as an `'exception'` event ({ status:'error', message, cause:{ pattern, data } }).
  @SubscribeMessage('throw-default')
  throwDefault(): never {
    throw new WsException('Invalid credentials.');
  }

  // #69 — custom @Catch(WsException) filter reshapes the error onto a custom event.
  @UseFilters(new CustomWsExceptionFilter())
  @SubscribeMessage('throw-custom')
  throwCustom(): never {
    throw new WsException('boom');
  }

  // #69 — @Catch() extending BaseWsExceptionFilter catches a non-Ws Error too and
  // delegates to the default handler (generic 'Internal server error').
  @UseFilters(new AllWsExceptionsFilter())
  @SubscribeMessage('throw-unknown')
  throwUnknown(): never {
    throw new Error('not a WsException');
  }

  // #70 — ValidationPipe with a WsException exceptionFactory; validates `data` only.
  @UsePipes(
    new ValidationPipe({
      exceptionFactory: (errors) => new WsException(errors),
    }),
  )
  @SubscribeMessage('create')
  create(@MessageBody() dto: CreateMessageDto): WsResponse<CreateMessageDto> {
    return { event: 'created', data: dto };
  }

  // #71 — guard authorizes from the handshake auth token (false -> 'Forbidden resource').
  @UseGuards(WsAuthGuard)
  @SubscribeMessage('secure')
  secure(): WsResponse<{ ok: boolean }> {
    return { event: 'secured', data: { ok: true } };
  }

  // #72 — interceptor wraps the plain result in a { data } envelope (-> ack callback).
  @UseInterceptors(WsTransformInterceptor)
  @SubscribeMessage('transform')
  transform(@MessageBody() data: unknown): { value: unknown } {
    return { value: data };
  }
}
