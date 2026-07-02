import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { markFunctional, markWildcard } from './functional.middleware';
import { MiddlewareDemoController } from './middleware-demo.controller';
import { RequestMarkerMiddleware } from './request-marker.middleware';

// Demonstrates every documented way to bind middleware via the MiddlewareConsumer:
//   - class middleware bound to a whole controller, with `.exclude()` for one route
//   - functional middleware scoped to a single `{ path, method }`
//   - a wildcard route using Express 5's *named* wildcard syntax (`*splat`)
// (The CsrfModule already proves the `consumer.apply(...).forRoutes()` real-world case.)
@Module({ controllers: [MiddlewareDemoController] })
export class MiddlewareModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Class middleware across the whole controller — except GET /mw/skip.
    consumer
      .apply(RequestMarkerMiddleware)
      .exclude({ path: 'mw/skip', method: RequestMethod.GET })
      .forRoutes(MiddlewareDemoController);

    // Functional middleware scoped to one route via a { path, method } descriptor.
    consumer
      .apply(markFunctional)
      .forRoutes({ path: 'mw/fn', method: RequestMethod.GET });

    // Wildcard route. Under Express 5 (Nest 11) a bare `*` is no longer valid — the wildcard
    // must be *named*: `*splat` (or the optional `{*splat}`). See the docs issues log.
    consumer
      .apply(markWildcard)
      .forRoutes({ path: 'mw/wild/*splat', method: RequestMethod.ALL });
  }
}
