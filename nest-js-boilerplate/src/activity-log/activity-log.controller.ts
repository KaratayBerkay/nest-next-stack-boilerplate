import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { OptionalAuthGuard } from './optional-auth.guard';
import { ActivityLogService } from './activity-log.service';
import { LogActivityDto } from './dto/log-activity.dto';

@Controller('activity-logs')
@UseGuards(OptionalAuthGuard)
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Post()
  @HttpCode(202)
  logActivity(@Body() dto: LogActivityDto, @Req() req: Request): void {
    this.activityLogService.logEvents(dto.events, req);
  }
}
