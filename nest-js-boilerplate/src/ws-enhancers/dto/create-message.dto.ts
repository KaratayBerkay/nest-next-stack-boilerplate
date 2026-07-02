import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

/**
 * DTO validated by the gateway's `ValidationPipe` (websockets/pipes, #70). Pipes in a
 * gateway apply only to the `data` parameter (`@MessageBody()`), never to the socket.
 */
export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  text!: string;

  @IsInt()
  @Min(1)
  priority!: number;
}
