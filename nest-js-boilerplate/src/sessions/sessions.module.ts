import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { SessionsResolver } from './sessions.resolver';

@Module({
  imports: [AuthModule, RealtimeModule],
  providers: [SessionsResolver],
})
export class SessionsModule {}
