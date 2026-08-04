import { forwardRef, Module } from '@nestjs/common';
import { AuthContractsModule } from '../auth/auth-contracts.module';
import { WireCryptoService } from './wire-crypto.service';
import { StorageCryptoService } from './storage-crypto.service';
import { WireCryptoController } from './wire-crypto.controller';

@Module({
  imports: [forwardRef(() => AuthContractsModule)],
  controllers: [WireCryptoController],
  providers: [WireCryptoService, StorageCryptoService],
  exports: [WireCryptoService, StorageCryptoService],
})
export class WireCryptoModule {}
