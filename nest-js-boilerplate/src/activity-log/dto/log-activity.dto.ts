import { Type } from 'class-transformer';
import {
  IsArray,
  IsString,
  IsOptional,
  IsNumber,
  IsObject,
  ArrayMinSize,
  ArrayMaxSize,
  MaxLength,
  MinLength,
  IsIn,
  ValidateNested,
} from 'class-validator';

const CATEGORIES = [
  'session',
  'page',
  'http-exception',
  'application-exception',
  'network',
  'database',
  'performance',
  'rtc',
] as const;

const EXCEPTION_TYPES = [
  'CLIENT_ERROR',
  'CLIENT_REJECTION',
  'CLIENT_REQUEST_ERROR',
] as const;

export class FrontendEventDto {
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  eventType: string;

  @IsString()
  @MinLength(1)
  @MaxLength(64)
  clientSessionId: string;

  @IsString()
  timestamp: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  userAgent?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @IsIn(CATEGORIES)
  category?: string;

  @IsOptional()
  @IsString()
  event?: string;

  @IsOptional()
  @IsString()
  @IsIn(EXCEPTION_TYPES)
  exceptionType?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsNumber()
  durationMs?: number;

  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsIn(['call', 'meeting', 'stream'])
  rtcKind?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  rtcId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  roomName?: string;

  @IsOptional()
  @IsIn(['audio', 'video', 'screen'])
  mediaType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  phase?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4096)
  errorMessage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16384)
  stack?: string;
}

export class LogActivityDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => FrontendEventDto)
  events: FrontendEventDto[];
}
