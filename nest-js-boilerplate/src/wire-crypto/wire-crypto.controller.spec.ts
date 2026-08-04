import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from 'nestjs-pino';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { WireCryptoController } from './wire-crypto.controller';
import { WireCryptoService } from './wire-crypto.service';

describe('WireCryptoController', () => {
  let controller: WireCryptoController;
  let wire: {
    setPeerPublicKey: jest.Mock;
    getServerPublicKey: jest.Mock;
  };

  beforeEach(async () => {
    wire = {
      setPeerPublicKey: jest.fn().mockResolvedValue(undefined),
      getServerPublicKey: jest.fn().mockResolvedValue('b'.repeat(64)),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WireCryptoController],
      providers: [
        { provide: WireCryptoService, useValue: wire },
        { provide: Logger, useValue: { log: jest.fn(), debug: jest.fn() } },
      ],
    })
      .overrideGuard(SessionAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(WireCryptoController);
  });

  it('handshake stores the client key and returns the server key', async () => {
    const res = await controller.handshake(
      { userId: 'u1', sessionId: 's1' } as never,
      { publicKey: 'a'.repeat(64) },
    );
    expect(wire.setPeerPublicKey).toHaveBeenCalledWith('s1', 'a'.repeat(64));
    expect(res).toEqual({ serverPublicKey: 'b'.repeat(64), ok: true });
  });

  it('handshake rejects a sessionless request', async () => {
    await expect(
      controller.handshake({ userId: 'u1' } as never, {
        publicKey: 'a'.repeat(64),
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('handshake 404s when no server keys exist', async () => {
    wire.getServerPublicKey.mockResolvedValue(null);
    await expect(
      controller.handshake({ userId: 'u1', sessionId: 's1' } as never, {
        publicKey: 'a'.repeat(64),
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('server-key returns the session public key', async () => {
    const res = await controller.getServerKey({
      userId: 'u1',
      sessionId: 's1',
    } as never);
    expect(res).toEqual({ serverPublicKey: 'b'.repeat(64) });
  });
});
