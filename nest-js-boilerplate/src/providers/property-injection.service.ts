import { Inject, Injectable } from '@nestjs/common';
import { CatsService } from './cats.service';

// Property-based injection — the documented alternative to constructor DI (constructor is
// preferred for visibility, but @Inject() on a property is supported).
@Injectable()
export class PropertyInjectionService {
  @Inject(CatsService)
  private readonly catsService!: CatsService;

  count(): number {
    return this.catsService.findAll().length;
  }
}
