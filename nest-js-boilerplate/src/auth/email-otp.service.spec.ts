import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { EmailOtpService } from './email-otp.service';
import { MailService } from '../mail/mail.service';
import { TokenStoreService } from './token-store.service';

describe('EmailOtpService', () => {
  let service: EmailOtpService;
  let mail: { enqueue: jest.Mock };
  let tokenStore: {
    writeEmailOtp: jest.Mock;
    consumeEmailOtp: jest.Mock;
    peekEmailOtp: jest.Mock;
    incrementOtpAttempts: jest.Mock;
    deleteEmailOtp: jest.Mock;
    getOtpResendCooldown: jest.Mock;
    setOtpResendCooldown: jest.Mock;
  };

  beforeEach(async () => {
    tokenStore = {
      writeEmailOtp: jest.fn().mockResolvedValue(undefined),
      consumeEmailOtp: jest.fn().mockResolvedValue(undefined),
      peekEmailOtp: jest.fn(),
      incrementOtpAttempts: jest.fn().mockResolvedValue(undefined),
      deleteEmailOtp: jest.fn().mockResolvedValue(undefined),
      getOtpResendCooldown: jest.fn().mockResolvedValue(0),
      setOtpResendCooldown: jest.fn().mockResolvedValue(undefined),
    };

    mail = { enqueue: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailOtpService,
        { provide: TokenStoreService, useValue: tokenStore },
        { provide: MailService, useValue: mail },
      ],
    }).compile();

    service = module.get<EmailOtpService>(EmailOtpService);
  });

  const userId = 'u1';
  const email = 'alice@example.com';
  const purpose = 'LOGIN' as const;

  describe('verify', () => {
    it('succeeds with a matching code', async () => {
      tokenStore.peekEmailOtp.mockResolvedValue({
        code: '123456',
        email,
        attempts: 0,
      });

      const result = await service.verify(userId, '123456', purpose);

      expect(result).toBe(true);
      expect(tokenStore.consumeEmailOtp).toHaveBeenCalledWith(
        purpose,
        userId,
      );
    });

    it('throws when no OTP is stored (expired)', async () => {
      tokenStore.peekEmailOtp.mockResolvedValue(null);

      await expect(
        service.verify(userId, '123456', purpose),
      ).rejects.toThrow(UnauthorizedException);
      expect(tokenStore.consumeEmailOtp).not.toHaveBeenCalled();
    });

    it('throws on wrong code and increments attempts', async () => {
      tokenStore.peekEmailOtp.mockResolvedValue({
        code: '123456',
        email,
        attempts: 0,
      });

      await expect(
        service.verify(userId, '000000', purpose),
      ).rejects.toThrow(BadRequestException);
      expect(tokenStore.incrementOtpAttempts).toHaveBeenCalledWith(
        purpose,
        userId,
      );
      expect(tokenStore.consumeEmailOtp).not.toHaveBeenCalled();
    });

    it('invalidates the OTP after max attempts', async () => {
      tokenStore.peekEmailOtp.mockResolvedValue({
        code: '123456',
        email,
        attempts: 5,
      });

      await expect(
        service.verify(userId, '123456', purpose),
      ).rejects.toThrow(BadRequestException);
      expect(tokenStore.deleteEmailOtp).toHaveBeenCalledWith(
        purpose,
        userId,
      );
      expect(tokenStore.consumeEmailOtp).not.toHaveBeenCalled();
    });
  });

  describe('resend', () => {
    it('allows resend when no cooldown is active', async () => {
      tokenStore.peekEmailOtp.mockResolvedValue(null);

      await service.resend(userId, email, purpose);

      expect(tokenStore.writeEmailOtp).toHaveBeenCalled();
      expect(mail.enqueue).toHaveBeenCalled();
      expect(tokenStore.setOtpResendCooldown).toHaveBeenCalled();
    });

    it('deletes existing OTP before generating a new one', async () => {
      tokenStore.peekEmailOtp.mockResolvedValue({
        code: '123456',
        email,
        attempts: 0,
      });

      await service.resend(userId, email, purpose);

      expect(tokenStore.deleteEmailOtp).toHaveBeenCalledWith(
        purpose,
        userId,
      );
      expect(tokenStore.writeEmailOtp).toHaveBeenCalled();
    });

    it('blocks resend within cooldown', async () => {
      tokenStore.getOtpResendCooldown.mockResolvedValue(45);

      await expect(
        service.resend(userId, email, purpose),
      ).rejects.toThrow(BadRequestException);
      expect(tokenStore.writeEmailOtp).not.toHaveBeenCalled();
    });
  });
});
