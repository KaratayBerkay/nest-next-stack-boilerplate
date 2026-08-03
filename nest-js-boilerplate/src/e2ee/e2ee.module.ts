import { Module, forwardRef } from '@nestjs/common';
import { AuthContractsModule } from '../auth/auth-contracts.module';
import { E2eeKeysService } from './e2ee-keys.service';
import { E2eeKeysController } from './e2ee-keys.controller';
import { E2eeRoomsService } from './e2ee-rooms.service';
import { E2eeRoomsController } from './e2ee-rooms.controller';
import { E2EE_LIFECYCLE_HOOK } from './e2ee-lifecycle.tokens';

@Module({
  imports: [
    forwardRef(() => AuthContractsModule),
  ],
  controllers: [E2eeKeysController, E2eeRoomsController],
  providers: [
    E2eeKeysService,
    E2eeRoomsService,
    { provide: E2EE_LIFECYCLE_HOOK, useExisting: E2eeKeysService },
  ],
  exports: [E2eeKeysService, E2eeRoomsService, E2EE_LIFECYCLE_HOOK],
})
export class E2eeModule {}
