import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class OneTimePrekeyDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  keyId!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  publicKey!: string;
}

export class RegisterBundleDto {
  @IsObject()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Opaque key-bundle object (identity + signed prekey + sigs)',
  })
  bundle!: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OneTimePrekeyDto)
  @ApiProperty({
    required: false,
    description: 'Initial one-time prekeys (consumed once each)',
  })
  oneTimePrekeys?: OneTimePrekeyDto[];
}
