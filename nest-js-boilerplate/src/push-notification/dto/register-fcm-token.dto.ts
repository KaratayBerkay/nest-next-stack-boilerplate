import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

const PLATFORMS = ['android', 'ios', 'web'] as const;

export class RegisterFcmTokenDto {
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  token: string;

  @IsOptional()
  @IsString()
  @IsIn(PLATFORMS)
  platform?: string;
}
