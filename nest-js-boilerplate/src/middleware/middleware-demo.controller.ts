import { Controller, Get } from '@nestjs/common';

// Plain controller whose routes exist only to be targeted by the middleware bindings in
// MiddlewareModule. The handlers return a marker; the *headers* (set by middleware) are what
// the e2e asserts, proving which middleware ran for each route.
@Controller('mw')
export class MiddlewareDemoController {
  // Covered by the class middleware (controller-wide binding).
  @Get('all')
  all(): { route: string } {
    return { route: 'all' };
  }

  // Covered by the class middleware AND the path+method functional binding.
  @Get('fn')
  fn(): { route: string } {
    return { route: 'fn' };
  }

  // Covered by the class middleware's controller binding but excluded via `.exclude()`.
  @Get('skip')
  skip(): { route: string } {
    return { route: 'skip' };
  }

  // Matched by the wildcard route binding (`mw/wild/*splat`).
  @Get('wild/item')
  wild(): { route: string } {
    return { route: 'wild' };
  }
}
