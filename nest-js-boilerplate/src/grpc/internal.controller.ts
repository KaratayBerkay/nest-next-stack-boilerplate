import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';

interface PingRequest {
  message: string;
}
interface PingReply {
  message: string;
  timestamp: number;
}
interface SumRequest {
  numbers: number[];
}
interface SumReply {
  total: number;
}
interface CountdownRequest {
  from: number;
}
interface CountdownReply {
  value: number;
}

/**
 * gRPC handlers for the internal `Internal` service (see `proto/internal.proto`). These run
 * over the gRPC transport for service-to-service calls, separate from the public GraphQL/REST
 * surface. The first `@GrpcMethod` arg names the proto service, the second the RPC method.
 */
@Controller()
export class InternalController {
  /** Unary RPC: echo the message back with a server timestamp. */
  @GrpcMethod('Internal', 'Ping')
  ping(data: PingRequest): PingReply {
    return { message: data.message, timestamp: Date.now() };
  }

  /** Unary RPC: typed request/response round-trip. */
  @GrpcMethod('Internal', 'Sum')
  sum(data: SumRequest): SumReply {
    return { total: (data.numbers ?? []).reduce((acc, n) => acc + n, 0) };
  }

  /** Server-streaming RPC: returning an Observable streams each emission to the caller. */
  @GrpcMethod('Internal', 'Countdown')
  countdown(data: CountdownRequest): Observable<CountdownReply> {
    return new Observable<CountdownReply>((subscriber) => {
      for (let value = data.from; value >= 1; value -= 1) {
        subscriber.next({ value });
      }
      subscriber.complete();
    });
  }
}
