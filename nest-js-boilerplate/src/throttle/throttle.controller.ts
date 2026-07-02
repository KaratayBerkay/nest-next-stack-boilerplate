import { Controller, Get } from '@nestjs/common';
import { SkipThrottle, Throttle } from '@nestjs/throttler';

@Controller('throttle')
export class ThrottleController {
  // Override the global limit with a tight one to demonstrate 429s: 3 requests / 60s.
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Get('limited')
  limited(): { ok: true } {
    return { ok: true };
  }

  // Opt out of rate limiting entirely.
  @SkipThrottle()
  @Get('unlimited')
  unlimited(): { ok: true } {
    return { ok: true };
  }
}
