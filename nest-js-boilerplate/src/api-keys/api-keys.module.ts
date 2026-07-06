import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ApiKeysResolver } from './api-keys.resolver';
import { ApiKeysService } from './api-keys.service';
import { ApiKeyGuard } from './api-keys.guard';

@Module({
  imports: [AuthModule],
  providers: [ApiKeysResolver, ApiKeysService, ApiKeyGuard],
  exports: [ApiKeysService, ApiKeyGuard],
})
export class ApiKeysModule {}
