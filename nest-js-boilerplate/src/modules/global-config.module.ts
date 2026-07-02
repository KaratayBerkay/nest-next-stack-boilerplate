import { Global, Module } from '@nestjs/common';
import { APP_INFO } from './modules.tokens';

// @Global() module: once registered, its exported provider is available everywhere WITHOUT the
// consuming module having to import it. (The docs caution: register a global module only once.)
@Global()
@Module({
  providers: [{ provide: APP_INFO, useValue: { name: 'nest-boilerplate' } }],
  exports: [APP_INFO],
})
export class GlobalConfigModule {}
