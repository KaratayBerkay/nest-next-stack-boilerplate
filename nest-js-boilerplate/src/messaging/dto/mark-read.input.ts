import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MarkReadInput {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ description: 'User ID whose messages to mark as read' })
  userId!: string;
}
