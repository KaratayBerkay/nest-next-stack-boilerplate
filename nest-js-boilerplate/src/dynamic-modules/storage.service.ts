import { Inject, Injectable } from '@nestjs/common';
import { MODULE_OPTIONS_TOKEN } from './storage.module-definition';
import type { StorageModuleOptions } from './storage.interfaces';

// Injects the builder-generated MODULE_OPTIONS_TOKEN instead of a hand-rolled 'CONFIG_OPTIONS'.
@Injectable()
export class StorageService {
  constructor(
    @Inject(MODULE_OPTIONS_TOKEN)
    private readonly options: StorageModuleOptions,
  ) {}

  location(key: string): string {
    return `${this.options.bucket}/${key}`;
  }
}
