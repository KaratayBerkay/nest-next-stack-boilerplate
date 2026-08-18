import { MailProcessor } from './mail.processor';
import type { SendMailOptions, SentMail } from './mail.transport';

interface QueuedEmail {
  id: string;
  to: string;
  subject: string;
  template: string | null;
  variables: unknown;
  attempts: number;
}

interface PoolAccount {
  email: string;
}

interface MockPrismaService {
  emailMessage: {
    findUnique: jest.Mock<Promise<QueuedEmail | null>, [unknown]>;
    update: jest.Mock;
  };
  $transaction: jest.Mock<Promise<unknown[]>, [unknown[]]>;
}

interface MockTransport {
  send: jest.Mock<Promise<SentMail>, [SendMailOptions]>;
}

interface MockMxrouteAccounts {
  configured: boolean;
  claimAvailableAccount: jest.Mock<Promise<PoolAccount | null>, []>;
  createAccount: jest.Mock<Promise<PoolAccount>, [string]>;
  getDecryptedPassword: jest.Mock<Promise<string>, [string]>;
  recordSend: jest.Mock<unknown, [string]>;
}

interface MockConfigService {
  get: (key: string, def?: string) => string | undefined;
}

function mockPrisma(): MockPrismaService {
  return {
    emailMessage: {
      findUnique: jest.fn<Promise<QueuedEmail | null>, [unknown]>(),
      update: jest.fn((args: unknown) => ({ __update: args })),
    },
    // Real Prisma executes each element of the array; the mock does the same
    // so assertions on transport.send / recordSend call counts stay accurate.
    $transaction: jest.fn<Promise<unknown[]>, [unknown[]]>((ops) =>
      Promise.resolve(ops),
    ),
  };
}

function mockTransport(): MockTransport {
  return {
    send: jest
      .fn<Promise<SentMail>, [SendMailOptions]>()
      .mockResolvedValue({ provider: 'smtp' }),
  };
}

function mockMxrouteAccounts(configured = true): MockMxrouteAccounts {
  return {
    configured,
    claimAvailableAccount: jest.fn<Promise<PoolAccount | null>, []>(),
    createAccount: jest.fn<Promise<PoolAccount>, [string]>(),
    getDecryptedPassword: jest
      .fn<Promise<string>, [string]>()
      .mockResolvedValue('decrypted-pass'),
    recordSend: jest.fn<unknown, [string]>((email) => ({
      __recordSend: email,
    })),
  };
}

function mockConfig(): MockConfigService {
  return {
    get: (key: string, def?: string) =>
      key === 'MAIL_FROM' ? 'noreply@berwallet.online' : def,
  };
}

function queuedEmail(id: string): QueuedEmail {
  return {
    id,
    to: `user-${id}@example.com`,
    subject: 'Welcome',
    template: null,
    variables: null,
    attempts: 0,
  };
}

describe('MailProcessor', () => {
  let prisma: MockPrismaService;
  let transport: MockTransport;
  let mxroute: MockMxrouteAccounts;
  let processor: MailProcessor;

  beforeEach(() => {
    prisma = mockPrisma();
    transport = mockTransport();
    mxroute = mockMxrouteAccounts();
    processor = new MailProcessor(
      prisma as never,
      transport as never,
      mxroute as never,
      mockConfig() as never,
    );
  });

  /** 10 queued welcome emails, one per fresh signup — the actual scenario
   *  this session hit: a burst of new users all triggering a send at once. */
  const TEN_USERS = Array.from({ length: 10 }, (_, i) => queuedEmail(`u${i}`));

  it('reuses one pool account across all 10 sends when it has headroom the whole time', async () => {
    const accountA = { email: 'noreply-aaa@berwallet.online' };
    mxroute.claimAvailableAccount.mockResolvedValue(accountA);

    for (const email of TEN_USERS) {
      prisma.emailMessage.findUnique.mockResolvedValueOnce(email);
      await processor.process({ data: { emailId: email.id } } as never);
    }

    expect(mxroute.createAccount).not.toHaveBeenCalled();
    expect(transport.send).toHaveBeenCalledTimes(10);
    for (const call of transport.send.mock.calls) {
      expect(call[0].from).toEqual({
        email: accountA.email,
        password: 'decrypted-pass',
      });
    }
    expect(mxroute.recordSend).toHaveBeenCalledTimes(10);
    expect(mxroute.recordSend).toHaveBeenCalledWith(accountA.email);
    // Send-status write and ledger bump must land in the same transaction,
    // every time — not two separate awaits that could desync on a crash.
    expect(prisma.$transaction).toHaveBeenCalledTimes(10);
  });

  it('creates a new account only once the claimed one is out of headroom, then reuses the new one — never one new account per send', async () => {
    const accountA = { email: 'noreply-aaa@berwallet.online' };
    const accountB = { email: 'noreply-bbb@berwallet.online' };

    // Users 1-4: account A is claimable. User 5: A is tapped out (claim
    // misses) so a fresh account B gets created. Users 6-10: B is now
    // claimable, so it's reused rather than minting yet another account.
    mxroute.claimAvailableAccount
      .mockResolvedValueOnce(accountA)
      .mockResolvedValueOnce(accountA)
      .mockResolvedValueOnce(accountA)
      .mockResolvedValueOnce(accountA)
      .mockResolvedValueOnce(null)
      .mockResolvedValue(accountB);
    mxroute.createAccount.mockResolvedValue(accountB);

    const usedFrom: string[] = [];
    for (const email of TEN_USERS) {
      prisma.emailMessage.findUnique.mockResolvedValueOnce(email);
      await processor.process({ data: { emailId: email.id } } as never);
      const lastCall = transport.send.mock.calls.at(-1)?.[0];
      usedFrom.push(lastCall!.from!.email);
    }

    expect(usedFrom).toEqual([
      accountA.email,
      accountA.email,
      accountA.email,
      accountA.email,
      accountB.email, // just created
      accountB.email,
      accountB.email,
      accountB.email,
      accountB.email,
      accountB.email,
    ]);
    // The regression this guards against: createAccount() firing once per
    // send instead of only when the pool genuinely has nothing claimable —
    // that pattern is what left 10+ untracked real mailboxes on MXRoute.
    expect(mxroute.createAccount).toHaveBeenCalledTimes(1);
    expect(mxroute.recordSend).toHaveBeenCalledTimes(10);
    expect(
      mxroute.recordSend.mock.calls.filter((c) => c[0] === accountA.email),
    ).toHaveLength(4);
    expect(
      mxroute.recordSend.mock.calls.filter((c) => c[0] === accountB.email),
    ).toHaveLength(6);
  });

  it('falls back to the static transport (no pool account) when MXRoute is not configured', async () => {
    mxroute.configured = false;
    const email = queuedEmail('solo');
    prisma.emailMessage.findUnique.mockResolvedValueOnce(email);

    await processor.process({ data: { emailId: email.id } } as never);

    expect(mxroute.claimAvailableAccount).not.toHaveBeenCalled();
    expect(mxroute.createAccount).not.toHaveBeenCalled();
    expect(transport.send).toHaveBeenCalledWith(
      expect.objectContaining({ from: undefined }),
    );
    expect(mxroute.recordSend).not.toHaveBeenCalled();
    // No account to bump the ledger for, so the plain update runs standalone
    // rather than through $transaction.
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.emailMessage.update).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- @types/jest's objectContaining() is typed `any`
        data: expect.objectContaining({ status: 'SENT' }),
      }),
    );
  });

  it('marks FAILED and never records a send when the transport throws', async () => {
    mxroute.claimAvailableAccount.mockResolvedValue({
      email: 'noreply-aaa@berwallet.online',
    });
    transport.send.mockRejectedValue(new Error('Connection timeout'));
    const email = queuedEmail('fails');
    prisma.emailMessage.findUnique.mockResolvedValueOnce(email);

    await expect(
      processor.process({ data: { emailId: email.id } } as never),
    ).rejects.toThrow('Connection timeout');

    expect(mxroute.recordSend).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.emailMessage.update).toHaveBeenLastCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- @types/jest's objectContaining() is typed `any`
        data: expect.objectContaining({
          status: 'FAILED',
          lastError: 'Connection timeout',
        }),
      }),
    );
  });
});
