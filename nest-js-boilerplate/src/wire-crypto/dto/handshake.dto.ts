import { IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class HandshakeDto {
  @IsString()
  @Matches(/^[0-9a-f]{64}$/i, {
    message: 'publicKey must be a 32-byte X25519 key in hex',
  })
  @ApiProperty({
    description: 'Client device X25519 public key (32 bytes, hex)',
  })
  publicKey!: string;
}
