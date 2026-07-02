import { Module } from '@nestjs/common';
import { NeedsConfigService } from './needs-config.service';

// Note: this module deliberately does NOT import GlobalConfigModule — the @Global() registration
// elsewhere is enough for NeedsConfigService to inject APP_INFO.
@Module({
  providers: [NeedsConfigService],
  exports: [NeedsConfigService],
})
export class NeedsConfigModule {}
