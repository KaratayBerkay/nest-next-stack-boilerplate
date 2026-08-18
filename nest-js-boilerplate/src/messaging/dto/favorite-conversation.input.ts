import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FavoriteConversationInput {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ description: 'Peer user ID to favorite/unfavorite' })
  peerId!: string;
}
