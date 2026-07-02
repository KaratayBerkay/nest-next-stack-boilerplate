import { Controller, Get } from '@nestjs/common';
import { CatsService } from './cats.service';
import type { Cat } from './cats.repository';

/**
 * Async Local Storage (#118) — HTTP front door. The handler takes no user parameter: the identity
 * travels from the `x-user-id` header through the ALS middleware into the store, and the service
 * reads it from there. Hitting `GET /als/cats` with different headers returns different cats.
 */
@Controller('als')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Get('cats')
  getCat(): Promise<Cat> {
    return this.catsService.getCatForUser();
  }
}
