import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

/**
 * Payload validated by the microservice `ValidationPipe` (#83). Identical to an HTTP DTO —
 * the docs' point is that pipes are transport-agnostic; only the thrown exception differs
 * (`RpcException` instead of `HttpException`).
 */
export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  product!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}
