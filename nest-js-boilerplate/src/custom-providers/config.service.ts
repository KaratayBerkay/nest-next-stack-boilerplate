import { Injectable } from '@nestjs/common';

// Abstract/default service used purely as a DI token. `useClass` lets the module decide — at
// registration time — which concrete implementation the token resolves to (per environment).
export abstract class ConfigService {
  abstract get(key: string): string;
}

@Injectable()
export class DevelopmentConfigService extends ConfigService {
  get(key: string): string {
    return `dev:${key}`;
  }
}

@Injectable()
export class ProductionConfigService extends ConfigService {
  get(key: string): string {
    return `prod:${key}`;
  }
}
