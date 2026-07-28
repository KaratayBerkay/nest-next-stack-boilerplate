import { randomInt } from 'node:crypto';
import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { TokenStoreService } from './token-store.service';

const MAX_OTP_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

@Injectable()
export class EmailOtpService {
  private readonly logger = new Logger(EmailOtpService.name);

  constructor(
    private readonly tokenStore: TokenStoreService,
    private readonly mail: MailService,
  ) {}

  async generate(
    userId: string,
    email: string,
    purpose: 'REGISTRATION' | 'LOGIN',
  ): Promise<void> {
    const code = String(randomInt(100000, 999999));

    await this.tokenStore.writeEmailOtp(purpose, userId, code, email);

    await this.mail.enqueue({
      to: email,
      userId,
      subject:
        purpose === 'REGISTRATION'
          ? 'Your email verification code'
          : 'Your login verification code',
      template: 'email-otp',
      variables: { code, purpose: purpose.toLowerCase(), name: '' },
    });

    this.logger.debug(`Email OTP sent for ${purpose} userId=${userId}`);
  }

  async verify(
    userId: string,
    code: string,
    purpose: 'REGISTRATION' | 'LOGIN',
  ): Promise<boolean> {
    const stored = await this.tokenStore.peekEmailOtp(purpose, userId);
    if (!stored) {
      throw new UnauthorizedException({
        exc: 'EX_AUTH_OTP_EXPIRED',
        msg: 'Verification code expired or not found',
        key: 'auth.errors.otpExpired',
      });
    }

    if (stored.attempts >= MAX_OTP_ATTEMPTS) {
      await this.tokenStore.deleteEmailOtp(purpose, userId);
      throw new BadRequestException({
        exc: 'EX_AUTH_OTP_MAX_ATTEMPTS',
        msg: 'Too many incorrect attempts',
        key: 'auth.errors.otpMaxAttempts',
      });
    }

    if (stored.code !== code) {
      await this.tokenStore.incrementOtpAttempts(purpose, userId);
      const remaining = MAX_OTP_ATTEMPTS - stored.attempts - 1;
      throw new BadRequestException({
        exc: 'EX_AUTH_OTP_INVALID',
        msg: `Invalid code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining`,
        key: 'auth.errors.otpInvalid',
      });
    }

    await this.tokenStore.consumeEmailOtp(purpose, userId);
    return true;
  }

  async resend(
    userId: string,
    email: string,
    purpose: 'REGISTRATION' | 'LOGIN',
  ): Promise<void> {
    const cooldownKey = `otp_cooldown:${purpose}:${userId}`;
    const remaining = await this.tokenStore.getOtpResendCooldown(cooldownKey);
    if (remaining > 0) {
      throw new BadRequestException({
        exc: 'EX_AUTH_OTP_RESEND_COOLDOWN',
        msg: `Please wait ${remaining} seconds before requesting a new code`,
        key: 'auth.errors.otpResendCooldown',
      });
    }

    const stored = await this.tokenStore.peekEmailOtp(purpose, userId);
    if (stored) {
      await this.tokenStore.deleteEmailOtp(purpose, userId);
    }

    await this.generate(userId, email, purpose);
    await this.tokenStore.setOtpResendCooldown(cooldownKey, RESEND_COOLDOWN_SECONDS);
  }
}
