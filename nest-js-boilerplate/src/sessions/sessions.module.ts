import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SessionsResolver } from './sessions.resolver';

@Module({
  imports: [AuthModule],
  providers: [SessionsResolver],
})
export class SessionsModule {}
