import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from 'nestjs-pino';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { WireCryptoController } from './wire-crypto.controller';
import { WireCryptoService } from './wire-crypto.service';

describe('WireCryptoController', () => {
  let controller: WireCryptoController;
  let wire: {
    hasKeys: jest.Mock;
    createSessionKeys: jest.Mock;
    setPeerPublicKey: jest.Mock;
    getServerPublicKey: jest.Mock;
    getCounters: jest.Mock;
  };

  beforeEach(async () => {
    wire = {
      hasKeys: jest.fn().mockResolvedValue(true),
      createSessionKeys: jest.fn().mockResolvedValue('a'.repeat(64)),
      setPeerPublicKey: jest.fn().mockResolvedValue(undefined),
      getServerPublicKey: jest.fn().mockResolvedValue('b'.repeat(64)),
      getCounters: jest
        .fn()
        .mockResolvedValue({ c2sSeq: 0, s2cSeq: 0 }),
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
    expect(wire.getCounters).toHaveBeenCalledWith(undefined, 's1');
    expect(res).toEqual({
      serverPublicKey: 'b'.repeat(64),
      ok: true,
      device: false,
      c2sSeq: 0,
      s2cSeq: 0,
    });
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

  it('server-key returns the session public key and counters', async () => {
    wire.getCounters.mockResolvedValue({ c2sSeq: 12, s2cSeq: 3 });
    const res = await controller.getServerKey({
      userId: 'u1',
      sessionId: 's1',
    } as never);
    expect(res).toEqual({
      serverPublicKey: 'b'.repeat(64),
      device: false,
      c2sSeq: 12,
      s2cSeq: 3,
    });
  });
});
