import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';
import { SessionAuthGuard } from './session-auth.guard';
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
  ],
  providers: [
    JwtAuthGuard,
    SessionAuthGuard,
    TokenStoreService,
    TokenDerivationService,
  ],
  exports: [
    JwtModule,
    JwtAuthGuard,
    SessionAuthGuard,
    TokenStoreService,
    TokenDerivationService,
  ],
})
export class AuthContractsModule {}
