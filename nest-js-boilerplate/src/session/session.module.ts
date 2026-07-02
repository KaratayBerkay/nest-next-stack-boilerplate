import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import session from 'express-session';
import { SessionController } from './session.controller';

/**
 * Techniques › Session (#39). `express-session`. The docs apply the middleware
 * globally via `app.use(session(...))` in main.ts; here it is bound through the
 * module's `configure()` so the feature is self-contained and testable in
 * isolation (standalone — not in AppModule).
 *
 * Default import (`import session`) not `import * as session` — under
 * `module: nodenext` + `esModuleInterop` the namespace form isn't callable
 * (TS2349), same class as cookie-parser/compression (see Docs issues log).
 *
 * Uses the default in-memory store: fine for a demo/test, but it leaks memory
 * and won't scale past one process — swap in a real store (Redis) for prod.
 */
@Module({ controllers: [SessionController] })
export class SessionModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(
        session({
          secret: 'my-secret',
          resave: false,
          saveUninitialized: false,
        }),
      )
      .forRoutes(SessionController);
  }
}
