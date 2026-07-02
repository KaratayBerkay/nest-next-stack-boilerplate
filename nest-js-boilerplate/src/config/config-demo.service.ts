import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ConfigType } from '@nestjs/config';
import databaseConfig from './database.config';

// Shows the two documented ways to read namespaced config:
//   1. Typed injection via the namespace's generated `.KEY` token + `ConfigType<...>` — the
//      compiler knows `host`/`port`, no casts.
//   2. The general-purpose `ConfigService.get('database.host')` (dotted-path) escape hatch.
@Injectable()
export class ConfigDemoService {
  constructor(
    @Inject(databaseConfig.KEY)
    private readonly dbConfig: ConfigType<typeof databaseConfig>,
    private readonly configService: ConfigService,
  ) {}

  getHostTyped(): string {
    return this.dbConfig.host;
  }

  getPortTyped(): number {
    return this.dbConfig.port;
  }

  getHostViaService(): string | undefined {
    return this.configService.get<string>('database.host');
  }
}
