import { Module, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { E2eeModule } from '../e2ee/e2ee.module';
import { JwtAuthGuard } from './jwt-auth.guard';
import { SessionAuthGuard } from './session-auth.guard';
import { SessionValidatorService } from './session-validator.service';
import { TokenDerivationService } from './token-derivation.service';
import { TokenStoreService } from './token-store.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>(
            'JWT_ACCESS_TTL',
            '900s',
          ) as `${number}${'s' | 'm' | 'h' | 'd'}`,
        },
      }),
    }),
    forwardRef(() => E2eeModule),
  ],
  providers: [
    JwtAuthGuard,
    SessionAuthGuard,
    SessionValidatorService,
    TokenStoreService,
    TokenDerivationService,
  ],
  exports: [
    JwtModule,
    JwtAuthGuard,
    SessionAuthGuard,
    SessionValidatorService,
    TokenStoreService,
    TokenDerivationService,
  ],
})
export class AuthContractsModule {}
