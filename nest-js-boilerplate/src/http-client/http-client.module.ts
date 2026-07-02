import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HttpClientController } from './http-client.controller';
import { RemoteApiService } from './remote-api.service';

/**
 * Techniques › HTTP module (#38). `@nestjs/axios`. Uses the async form
 * (`registerAsync`) of the documented `register({ timeout, maxRedirects })`
 * config so both are exercised; the options reach the axios instance and are
 * read back via `axiosRef.defaults` in a proof endpoint. Standalone (not in
 * AppModule).
 */
@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({ timeout: 8000, maxRedirects: 5 }),
    }),
  ],
  controllers: [HttpClientController],
  providers: [RemoteApiService],
})
export class HttpClientModule {}
