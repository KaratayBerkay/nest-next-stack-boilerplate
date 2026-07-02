import { Global, Module } from '@nestjs/common';
import { CryptoService } from './crypto.service';

// Global so any feature (auth, MFA, email) can inject CryptoService without re-importing.
@Global()
@Module({
  providers: [CryptoService],
  exports: [CryptoService],
})
export class CryptoModule {}
