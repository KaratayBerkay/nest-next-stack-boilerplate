import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SaveKeyBackupDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'XChaCha20-Poly1305 ciphertext of the key backup (base64)',
  })
  ciphertext!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'XChaCha20-Poly1305 nonce (base64)' })
  nonce!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Hex-encoded PBKDF2 salt used to derive the encryption key',
  })
  salt!: string;
}
