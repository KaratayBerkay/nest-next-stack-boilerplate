import { Module } from '@nestjs/common';
import { ThrottleController } from './throttle.controller';

// The global limiter (ThrottlerModule.forRoot + APP_GUARD HttpThrottlerGuard) is wired in
// AppModule; this module just exposes endpoints exercising @Throttle / @SkipThrottle.
@Module({ controllers: [ThrottleController] })
export class ThrottleModule {}
