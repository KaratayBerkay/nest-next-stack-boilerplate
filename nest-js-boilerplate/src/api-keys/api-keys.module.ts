import { Module } from '@nestjs/common';
import { ApiKeysResolver } from './api-keys.resolver';
import { ApiKeysService } from './api-keys.service';
import { ApiKeyGuard } from './api-keys.guard';

@Module({
  providers: [ApiKeysResolver, ApiKeysService, ApiKeyGuard],
  exports: [ApiKeysService, ApiKeyGuard],
})
export class ApiKeysModule {}
