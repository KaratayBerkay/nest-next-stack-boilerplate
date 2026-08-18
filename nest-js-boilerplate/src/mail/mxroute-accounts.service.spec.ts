import { ConfigService } from '@nestjs/config';
import { CryptoService } from '../common/crypto/crypto.service';
import { PrismaService } from '../prisma/prisma.service';
import { MxrouteAccountsService } from './mxroute-accounts.service';

/** Minimal ConfigService stub honoring the (key) signature MxrouteAccountsService uses. */
const makeConfig = (
  values: Record<string, string | undefined>,
): ConfigService =>
  ({
    get: (key: string) => values[key],
  }) as unknown as ConfigService;

const CREDS = {
  MXROUTE_SERVER: 'eagle.mxlogin.com',
  MXROUTE_USERNAME: 'berwallet',
  MXROUTE_API_KEY: 'Mx_test_key',
};

describe('MxrouteAccountsService', () => {
  const fetchMock = jest.fn();
  const mailAccountCreate = jest.fn();
  const mailAccountFindUniqueOrThrow = jest.fn();
  const mailAccountDeleteMany = jest.fn();
  const mailAccountFindMany = jest.fn();
  const executeRaw = jest.fn();
  const queryRaw = jest.fn();
  const prisma = {
    mailAccount: {
      create: mailAccountCreate,
      findUniqueOrThrow: mailAccountFindUniqueOrThrow,
      deleteMany: mailAccountDeleteMany,
      findMany: mailAccountFindMany,
    },
    $executeRaw: executeRaw,
    $queryRaw: queryRaw,
  } as unknown as PrismaService;
  const encrypt = jest.fn();
  const decrypt = jest.fn();
  const crypto = { encrypt, decrypt } as unknown as CryptoService;

  const makeService = (values: Record<string, string | undefined>) =>
    new MxrouteAccountsService(makeConfig(values), prisma, crypto);

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock;
    mailAccountCreate.mockReset();
    mailAccountFindUniqueOrThrow.mockReset();
    mailAccountDeleteMany.mockReset();
    mailAccountFindMany.mockReset();
    executeRaw.mockReset();
    queryRaw.mockReset();
    encrypt.mockReset();
    decrypt.mockReset();
  });

  describe('configured', () => {
    it('is false when any credential is missing', () => {
      expect(makeService({}).configured).toBe(false);
      expect(
        makeService({ MXROUTE_SERVER: 'x', MXROUTE_USERNAME: 'y' }).configured,
      ).toBe(false);
    });

    it('is true when all three credentials are set', () => {
      expect(makeService(CREDS).configured).toBe(true);
    });
  });

  describe('getSendStatus', () => {
    it('throws without calling fetch when not configured', async () => {
      const service = makeService({});

      await expect(
        service.getSendStatus('berwallet.online', 'noreply'),
      ).rejects.toThrow(/MXROUTE_SERVER/);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('calls the real MXRoute endpoint with the auth headers and returns computed remaining', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              email: 'noreply@berwallet.online',
              limit: 9600,
              sent: 42,
              suspended: false,
            },
          }),
      });

      const service = makeService(CREDS);
      const status = await service.getSendStatus('berwallet.online', 'noreply');

      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.mxroute.com/domains/berwallet.online/email-accounts/noreply',
        {
          headers: {
            'X-Server': 'eagle.mxlogin.com',
            'X-Username': 'berwallet',
            'X-API-Key': 'Mx_test_key',
          },
        },
      );
      expect(status).toEqual({
        email: 'noreply@berwallet.online',
        limit: 9600,
        sent: 42,
        remaining: 9558,
        suspended: false,
      });
    });

    it('throws the API-provided message when MXRoute returns success: false', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            success: false,
            error: { code: 'NOT_FOUND', message: 'Account not found' },
          }),
      });

      const service = makeService(CREDS);

      await expect(
        service.getSendStatus('berwallet.online', 'ghost'),
      ).rejects.toThrow(/Account not found/);
    });

    it('throws with the HTTP status when the response has no error body', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 503,
        json: () => Promise.resolve({}),
      });

      const service = makeService(CREDS);

      await expect(
        service.getSendStatus('berwallet.online', 'noreply'),
      ).rejects.toThrow(/HTTP 503/);
    });
  });

  describe('createAccount', () => {
    it('throws without calling fetch when not configured', async () => {
      const service = makeService({});

      await expect(service.createAccount('berwallet.online')).rejects.toThrow(
        /MXROUTE_SERVER/,
      );
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('creates the mailbox via MXRoute, encrypts the password, and persists it', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 201,
        json: () =>
          Promise.resolve({
            success: true,
            data: { email: 'noreply-abc@berwallet.online' },
          }),
      });
      encrypt.mockReturnValue(Buffer.from('encrypted'));
      mailAccountCreate.mockResolvedValue({
        id: 'row-1',
        email: 'noreply-abc@berwallet.online',
        encryptedPassword: Buffer.from('encrypted'),
        usage: 0,
        status: 'ACTIVE',
      });

      const service = makeService(CREDS);
      const account = await service.createAccount('berwallet.online');

      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.mxroute.com/domains/berwallet.online/email-accounts',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'X-Server': 'eagle.mxlogin.com',
            'X-Username': 'berwallet',
            'X-API-Key': 'Mx_test_key',
          }) as unknown,
        }),
      );
      const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      const sentBody = JSON.parse(init.body as string) as {
        username: string;
        password: string;
      };
      expect(sentBody.username).toMatch(/^noreply-/);
      expect(encrypt).toHaveBeenCalledWith(sentBody.password);
      expect(mailAccountCreate).toHaveBeenCalledWith({
        data: {
          email: 'noreply-abc@berwallet.online',
          encryptedPassword: Buffer.from('encrypted'),
        },
      });
      expect(account.email).toBe('noreply-abc@berwallet.online');
    });

    it('throws and never touches the database when MXRoute rejects the create', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 409,
        json: () =>
          Promise.resolve({
            success: false,
            error: { code: 'CONFLICT', message: 'Account already exists' },
          }),
      });

      const service = makeService(CREDS);

      await expect(service.createAccount('berwallet.online')).rejects.toThrow(
        /Account already exists/,
      );
      expect(mailAccountCreate).not.toHaveBeenCalled();
    });
  });

  describe('createNamedAccount', () => {
    it('throws without calling fetch when not configured', async () => {
      const service = makeService({});

      await expect(
        service.createNamedAccount('berwallet.online', 'test-user-1'),
      ).rejects.toThrow(/MXROUTE_SERVER/);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('creates the mailbox with the given local part and returns the generated password without persisting it', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 201,
        json: () =>
          Promise.resolve({
            success: true,
            data: { email: 'test-user-1@berwallet.online' },
          }),
      });

      const service = makeService(CREDS);
      const account = await service.createNamedAccount(
        'berwallet.online',
        'test-user-1',
      );

      const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      const sentBody = JSON.parse(init.body as string) as {
        username: string;
        password: string;
      };
      expect(sentBody.username).toBe('test-user-1');
      expect(account).toEqual({
        email: 'test-user-1@berwallet.online',
        password: sentBody.password,
      });
      expect(mailAccountCreate).not.toHaveBeenCalled();
      expect(encrypt).not.toHaveBeenCalled();
    });

    it('throws and never touches the database when MXRoute rejects the create', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 409,
        json: () =>
          Promise.resolve({
            success: false,
            error: { code: 'CONFLICT', message: 'Account already exists' },
          }),
      });

      const service = makeService(CREDS);

      await expect(
        service.createNamedAccount('berwallet.online', 'test-user-1'),
      ).rejects.toThrow(/Account already exists/);
      expect(mailAccountCreate).not.toHaveBeenCalled();
    });
  });

  describe('deleteAccount', () => {
    it('throws without calling fetch when not configured', async () => {
      const service = makeService({});

      await expect(
        service.deleteAccount(
          'berwallet.online',
          'noreply-abc@berwallet.online',
        ),
      ).rejects.toThrow(/MXROUTE_SERVER/);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('deletes via the local part and removes the MailAccount row', async () => {
      fetchMock.mockResolvedValue({ ok: true, status: 204 });

      const service = makeService(CREDS);
      await service.deleteAccount(
        'berwallet.online',
        'noreply-abc@berwallet.online',
      );

      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.mxroute.com/domains/berwallet.online/email-accounts/noreply-abc',
        expect.objectContaining({ method: 'DELETE' }),
      );
      expect(mailAccountDeleteMany).toHaveBeenCalledWith({
        where: { email: 'noreply-abc@berwallet.online' },
      });
    });

    it('treats a 404 as already-deleted and still cleans up the row', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve({}),
      });

      const service = makeService(CREDS);
      await service.deleteAccount(
        'berwallet.online',
        'noreply-abc@berwallet.online',
      );

      expect(mailAccountDeleteMany).toHaveBeenCalledWith({
        where: { email: 'noreply-abc@berwallet.online' },
      });
    });

    it('throws and does not touch the database on a non-404 API error', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        json: () =>
          Promise.resolve({ error: { code: 'ERR', message: 'boom' } }),
      });

      const service = makeService(CREDS);

      await expect(
        service.deleteAccount(
          'berwallet.online',
          'noreply-abc@berwallet.online',
        ),
      ).rejects.toThrow(/boom/);
      expect(mailAccountDeleteMany).not.toHaveBeenCalled();
    });
  });

  describe('claimAvailableAccount', () => {
    it('returns the claimed row when one is available', async () => {
      queryRaw.mockResolvedValue([
        { email: 'noreply-abc@berwallet.online', usage: 0 },
      ]);

      const service = makeService(CREDS);
      const account = await service.claimAvailableAccount();

      expect(queryRaw).toHaveBeenCalledTimes(1);
      const [strings] = queryRaw.mock.calls[0] as [TemplateStringsArray];
      const sql = strings.join('');
      expect(sql).toContain('FOR UPDATE SKIP LOCKED');
      expect(sql).toContain('ORDER BY "usage" ASC');
      expect(account).toEqual({
        email: 'noreply-abc@berwallet.online',
        usage: 0,
      });
    });

    it('returns null when nothing is claimable', async () => {
      queryRaw.mockResolvedValue([]);

      const service = makeService(CREDS);
      const account = await service.claimAvailableAccount();

      expect(account).toBeNull();
    });
  });

  describe('getLocalEstimatedRemaining', () => {
    it('returns full headroom when the account has never sent', async () => {
      mailAccountFindUniqueOrThrow.mockResolvedValue({
        usage: 250,
        firstSentAt: null,
      });

      const service = makeService(CREDS);
      const remaining = await service.getLocalEstimatedRemaining(
        'noreply-abc@berwallet.online',
      );

      expect(remaining).toBe(400);
    });

    it('subtracts usage while the rolling-hour window is still active', async () => {
      mailAccountFindUniqueOrThrow.mockResolvedValue({
        usage: 350,
        firstSentAt: new Date(Date.now() - 10 * 60 * 1000),
      });

      const service = makeService(CREDS);
      const remaining = await service.getLocalEstimatedRemaining(
        'noreply-abc@berwallet.online',
      );

      expect(remaining).toBe(50);
    });

    it('treats a window older than an hour as fully reset even though usage is unchanged', async () => {
      mailAccountFindUniqueOrThrow.mockResolvedValue({
        usage: 400,
        firstSentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      });

      const service = makeService(CREDS);
      const remaining = await service.getLocalEstimatedRemaining(
        'noreply-abc@berwallet.online',
      );

      expect(remaining).toBe(400);
    });

    it('never returns negative headroom', async () => {
      mailAccountFindUniqueOrThrow.mockResolvedValue({
        usage: 450,
        firstSentAt: new Date(),
      });

      const service = makeService(CREDS);
      const remaining = await service.getLocalEstimatedRemaining(
        'noreply-abc@berwallet.online',
      );

      expect(remaining).toBe(0);
    });
  });

  describe('resetExpiredWindows', () => {
    it('issues a raw UPDATE that zeroes usage/firstSentAt for expired windows only', async () => {
      executeRaw.mockResolvedValue(3);

      const service = makeService(CREDS);
      const count = await service.resetExpiredWindows();

      expect(executeRaw).toHaveBeenCalledTimes(1);
      const [strings] = executeRaw.mock.calls[0] as [TemplateStringsArray];
      const sql = strings.join('');
      expect(sql).toContain('UPDATE "MailAccount"');
      expect(sql).toContain('"usage" = 0');
      expect(sql).toContain('"firstSentAt" = NULL');
      expect(sql).not.toContain('"lastSentAt"');
      expect(count).toBe(3);
    });
  });

  describe('recordSend', () => {
    it('issues a raw UPDATE against the given email and returns the query unexecuted', () => {
      executeRaw.mockReturnValue('pending-query');

      const service = makeService(CREDS);
      const query = service.recordSend('noreply-abc@berwallet.online');

      expect(executeRaw).toHaveBeenCalledTimes(1);
      const [strings, ...values] = executeRaw.mock.calls[0] as [
        TemplateStringsArray,
        ...unknown[],
      ];
      expect(strings.join('')).toContain('UPDATE "MailAccount"');
      expect(strings.join('')).toContain('"usage" + 1');
      expect(values).toContainEqual('noreply-abc@berwallet.online');
      expect(query).toBe('pending-query');
    });
  });

  describe('getDecryptedPassword', () => {
    it('decrypts the stored password for the given email', async () => {
      mailAccountFindUniqueOrThrow.mockResolvedValue({
        email: 'noreply-abc@berwallet.online',
        encryptedPassword: Buffer.from('encrypted'),
      });
      decrypt.mockReturnValue('plaintext-pass');

      const service = makeService(CREDS);
      const password = await service.getDecryptedPassword(
        'noreply-abc@berwallet.online',
      );

      expect(mailAccountFindUniqueOrThrow).toHaveBeenCalledWith({
        where: { email: 'noreply-abc@berwallet.online' },
      });
      expect(decrypt).toHaveBeenCalledWith(Buffer.from('encrypted'));
      expect(password).toBe('plaintext-pass');
    });
  });

  describe('listAccounts', () => {
    it('throws without calling fetch when not configured', async () => {
      const service = makeService({});

      await expect(service.listAccounts('berwallet.online')).rejects.toThrow(
        /MXROUTE_SERVER/,
      );
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('calls the domain list endpoint and returns the raw account array', async () => {
      const accounts = [
        {
          username: 'noreply-aaa',
          email: 'noreply-aaa@berwallet.online',
          usage: 0.06,
          suspended: false,
        },
      ];
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, data: accounts }),
      });

      const service = makeService(CREDS);
      const result = await service.listAccounts('berwallet.online');

      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.mxroute.com/domains/berwallet.online/email-accounts',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Server': 'eagle.mxlogin.com',
            'X-Username': 'berwallet',
            'X-API-Key': 'Mx_test_key',
          }) as unknown,
        }),
      );
      expect(result).toEqual(accounts);
    });

    it('throws the API-provided message on failure', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        json: () =>
          Promise.resolve({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Something broke' },
          }),
      });

      const service = makeService(CREDS);

      await expect(service.listAccounts('berwallet.online')).rejects.toThrow(
        /Something broke/,
      );
    });
  });

  describe('reconcilePool', () => {
    // The exact scenario this exists for: local DB got reset (dev volume wipe),
    // MXRoute still has every sender mailbox any prior run ever created.
    const remoteAccounts = [
      {
        username: 'noreply-aaa',
        email: 'noreply-aaa@berwallet.online',
        usage: 0.06,
        suspended: false,
      }, // untracked, low usage, not suspended -> reclaim
      {
        username: 'noreply-bbb',
        email: 'noreply-bbb@berwallet.online',
        usage: 0.06,
        suspended: false,
      }, // already tracked locally -> leave alone
      {
        username: 'noreply-ccc',
        email: 'noreply-ccc@berwallet.online',
        usage: 5,
        suspended: false,
      }, // above the usage ceiling -> never touch, might have real content
      {
        username: 'noreply-ddd',
        email: 'noreply-ddd@berwallet.online',
        usage: 0.06,
        suspended: true,
      }, // suspended -> skip
      {
        username: 'test-user-1',
        email: 'test-user-1@berwallet.online',
        usage: 6.5,
        suspended: false,
      }, // recipient inbox, not a sender -> naming filter excludes it
      {
        username: 'test',
        email: 'test@berwallet.online',
        usage: 2.6,
        suspended: false,
      }, // not the noreply-* pool convention -> excluded
    ];

    function mockListThenPatches(patchCount: number) {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, data: remoteAccounts }),
      });
      for (let i = 0; i < patchCount; i++) {
        fetchMock.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true, data: {} }),
        });
      }
    }

    it('reclaims only the untracked, low-usage, non-suspended noreply-* accounts — never a recipient inbox or anything with real content', async () => {
      mockListThenPatches(1);
      mailAccountFindMany.mockResolvedValue([
        { email: 'noreply-bbb@berwallet.online' },
      ]);
      encrypt.mockReturnValue(Buffer.from('encrypted'));
      mailAccountCreate.mockResolvedValue({});

      const service = makeService(CREDS);
      const result = await service.reconcilePool('berwallet.online');

      expect(result).toEqual({ imported: 1, alreadyTracked: 5 });

      // Exactly one PATCH (the reclaim), for exactly the right account.
      const calls = fetchMock.mock.calls as [string, RequestInit | undefined][];
      const patchCalls = calls.filter((c) => c[1]?.method === 'PATCH');
      expect(patchCalls).toHaveLength(1);
      expect(patchCalls[0][0]).toBe(
        'https://api.mxroute.com/domains/berwallet.online/email-accounts/noreply-aaa',
      );

      expect(mailAccountCreate).toHaveBeenCalledTimes(1);
      expect(mailAccountCreate).toHaveBeenCalledWith({
        data: {
          email: 'noreply-aaa@berwallet.online',
          encryptedPassword: Buffer.from('encrypted'),
        },
      });
    });

    it('is idempotent: reconciling again once everything is tracked imports nothing', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, data: remoteAccounts }),
      });
      // Every noreply-* account now already has a local row.
      mailAccountFindMany.mockResolvedValue([
        { email: 'noreply-aaa@berwallet.online' },
        { email: 'noreply-bbb@berwallet.online' },
        { email: 'noreply-ccc@berwallet.online' },
        { email: 'noreply-ddd@berwallet.online' },
      ]);

      const service = makeService(CREDS);
      const result = await service.reconcilePool('berwallet.online');

      expect(result).toEqual({ imported: 0, alreadyTracked: 6 });
      expect(mailAccountCreate).not.toHaveBeenCalled();
      const calls = fetchMock.mock.calls as [string, RequestInit | undefined][];
      expect(calls.filter((c) => c[1]?.method === 'PATCH')).toHaveLength(0);
    });
  });

  describe('onModuleInit', () => {
    it('does nothing when MXRoute is not configured', async () => {
      const service = makeService({});

      await expect(service.onModuleInit()).resolves.toBeUndefined();
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('reconciles the pool on startup when configured', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            success: true,
            data: [
              {
                username: 'noreply-aaa',
                email: 'noreply-aaa@berwallet.online',
                usage: 0.06,
                suspended: false,
              },
            ],
          }),
      });
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, data: {} }),
      });
      mailAccountFindMany.mockResolvedValue([]);
      encrypt.mockReturnValue(Buffer.from('encrypted'));
      mailAccountCreate.mockResolvedValue({});

      const service = makeService(CREDS);

      await expect(service.onModuleInit()).resolves.toBeUndefined();
      expect(mailAccountCreate).toHaveBeenCalledTimes(1);
    });

    it('never rejects even if MXRoute is unreachable — startup must not depend on it', async () => {
      fetchMock.mockRejectedValue(new Error('connect ETIMEDOUT'));

      const service = makeService(CREDS);

      await expect(service.onModuleInit()).resolves.toBeUndefined();
    });
  });
});
