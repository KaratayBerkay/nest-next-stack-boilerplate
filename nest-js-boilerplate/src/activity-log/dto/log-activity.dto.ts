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
} from 'class-validator';

const CATEGORIES = [
  'session',
  'page',
  'http-exception',
  'application-exception',
  'network',
  'database',
  'performance',
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
}

export class LogActivityDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @Type(() => FrontendEventDto)
  events: FrontendEventDto[];
}
