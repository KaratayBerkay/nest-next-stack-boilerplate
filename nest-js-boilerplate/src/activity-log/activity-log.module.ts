import { Module } from '@nestjs/common';
import { AuthContractsModule } from '../auth/auth-contracts.module';
import { ActivityLogController } from './activity-log.controller';
import { ActivityLogService } from './activity-log.service';
import { OptionalAuthGuard } from './optional-auth.guard';

@Module({
  imports: [AuthContractsModule],
  controllers: [ActivityLogController],
  providers: [ActivityLogService, OptionalAuthGuard],
})
export class ActivityLogModule {}
