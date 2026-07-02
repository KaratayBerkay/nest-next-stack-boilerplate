import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CommonService } from './common.service';

// One half of a circular provider relationship. forwardRef() lets Nest reference CommonService
// before it's fully defined; without it, the essential metadata wouldn't be available and neither
// provider would instantiate.
@Injectable()
export class CatsService {
  constructor(
    @Inject(forwardRef(() => CommonService))
    private readonly commonService: CommonService,
  ) {}

  knock(): string {
    return 'cat';
  }

  // Reaches across to the forward-referenced provider — proves the dependency actually resolved.
  viaCommon(): string {
    return this.commonService.describe();
  }
}
