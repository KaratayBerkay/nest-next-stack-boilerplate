import { Module } from '@nestjs/common';
import { ThrottleController } from './throttle.controller';
import { RedisThrottlerStorage } from './redis-throttler-storage';

// The global limiter (ThrottlerModule.forRoot + APP_GUARD HttpThrottlerGuard) is wired in
// AppModule; this module just exposes endpoints exercising @Throttle / @SkipThrottle.
@Module({
  controllers: [ThrottleController],
  providers: [RedisThrottlerStorage],
  exports: [RedisThrottlerStorage],
})
export class ThrottleModule {}
