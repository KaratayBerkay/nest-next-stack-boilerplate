import { Inject, Injectable, Optional } from '@nestjs/common';
import { CatsService } from './cats.service';
import { GREETING } from './providers.tokens';

// Constructor-based DI (the preferred form per the docs): CatsService is injected by type.
// GREETING is an OPTIONAL provider — when its token is unbound, @Optional lets Nest inject
// `undefined` and the default parameter value supplies the fallback instead of failing to resolve.
@Injectable()
export class CatsReportService {
  constructor(
    private readonly catsService: CatsService,
    @Optional() @Inject(GREETING) private readonly greeting: string = 'Hello',
  ) {}

  summary(): string {
    return `${this.greeting}: ${this.catsService.findAll().length} cats`;
  }
}
