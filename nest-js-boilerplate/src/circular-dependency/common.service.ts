import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CatsService } from './cats.service';

// The other half — both sides of the relationship use @Inject(forwardRef(...)).
@Injectable()
export class CommonService {
  constructor(
    @Inject(forwardRef(() => CatsService))
    private readonly catsService: CatsService,
  ) {}

  describe(): string {
    return `common knows ${this.catsService.knock()}`;
  }
}
