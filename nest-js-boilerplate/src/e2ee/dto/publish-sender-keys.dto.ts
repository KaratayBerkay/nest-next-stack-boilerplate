import {
  IsArray,
  IsBase64,
  IsInt,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class WrappedSenderKeyDto {
  @IsUUID()
  @ApiProperty()
  recipientDeviceId!: string;

  @IsString()
  @IsBase64()
  @ApiProperty()
  wrappedKey!: string;

  @IsString()
  @IsBase64()
  @ApiProperty()
  wrapNonce!: string;
}

export class PublishSenderKeysDto {
  @IsInt()
  @Min(0)
  @ApiProperty()
  epoch!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WrappedSenderKeyDto)
  @ApiProperty({ type: [WrappedSenderKeyDto] })
  keys!: WrappedSenderKeyDto[];
}
