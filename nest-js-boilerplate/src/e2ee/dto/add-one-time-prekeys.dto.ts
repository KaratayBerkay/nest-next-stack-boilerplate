import { IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { OneTimePrekeyDto } from './register-bundle.dto';

export class AddOneTimePrekeysDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OneTimePrekeyDto)
  @ApiProperty({ description: 'Fresh one-time prekeys to top up the pool' })
  oneTimePrekeys!: OneTimePrekeyDto[];
}
