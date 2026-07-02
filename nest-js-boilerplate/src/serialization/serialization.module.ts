import { Module } from '@nestjs/common';
import { SerializationController } from './serialization.controller';

// docs.nestjs.com/techniques/serialization — self-contained feature module. The
// ClassSerializerInterceptor is bound at controller scope (see the controller). To enforce
// serialization application-wide instead, register it globally:
//   providers: [{ provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor }]
// We keep it route/controller-scoped so it doesn't wrap every other module's responses.
@Module({
  controllers: [SerializationController],
})
export class SerializationModule {}
