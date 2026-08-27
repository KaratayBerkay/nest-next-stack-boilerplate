import type { Response } from 'express';
import { ForbiddenException } from '@nestjs/common';
import { UploadController } from './upload.controller';

describe('UploadController', () => {
  let controller: UploadController;
  let mockS3bucket: {
    upload: jest.Mock;
    remove: jest.Mock;
    download: jest.Mock;
    exists: jest.Mock;
  };
  let mockStorageCrypto: { decryptBytes: jest.Mock; encryptBytes: jest.Mock };
  let mockThumbnails: { generate: jest.Mock };
  let mockUsage: { assertCanUploadBytes: jest.Mock };
  let mockPrisma: {
    pendingUpload: { findUnique: jest.Mock; upsert: jest.Mock };
    message: { findUnique: jest.Mock };
    roomMessage: { findUnique: jest.Mock };
    $transaction: jest.Mock;
    $executeRaw: jest.Mock;
  };
  let mockRes: { set: jest.Mock; end: jest.Mock };

  const user = { userId: 'u1', tier: 'FREE' } as never;

  beforeEach(() => {
    mockS3bucket = {
      upload: jest
        .fn()
        .mockResolvedValue('https://r2/uploads/messages/u1/x.png'),
      remove: jest.fn(),
      download: jest.fn(),
      exists: jest.fn(),
    };
    mockStorageCrypto = {
      decryptBytes: jest.fn(),
      encryptBytes: jest
        .fn()
        .mockReturnValue({ v: 'storage-v1', nonce: 'n1', ct: 'Y2lwaGVy' }),
    };
    mockThumbnails = { generate: jest.fn().mockResolvedValue(null) };
    mockUsage = {
      assertCanUploadBytes: jest.fn().mockResolvedValue(undefined),
    };
    mockPrisma = {
      pendingUpload: { findUnique: jest.fn(), upsert: jest.fn() },
      message: { findUnique: jest.fn() },
      roomMessage: { findUnique: jest.fn() },
      // Interactive $transaction: run the callback with `tx` === this same
      // mock, matching this repo's established Prisma-mock convention.
      $transaction: jest.fn((cb: (tx: typeof mockPrisma) => unknown) =>
        cb(mockPrisma),
      ),
      $executeRaw: jest.fn().mockResolvedValue(undefined),
    };
    mockRes = { set: jest.fn(), end: jest.fn() };

    controller = new UploadController(
      mockS3bucket as never,
      {} as never,
      mockThumbnails as never,
      mockStorageCrypto as never,
      mockPrisma as never,
      mockUsage as never,
    );
  });

  describe('serve', () => {
    it('fetches ciphertext from R2 and decrypts it for the uploader', async () => {
      mockPrisma.pendingUpload.findUnique.mockResolvedValue({
        uploadedBy: 'u1',
        v: 'storage-v1',
        nonce: 'n1',
        messageId: null,
        roomMessageId: null,
      });
      mockS3bucket.download.mockResolvedValue(Buffer.from('raw-cipher'));
      mockStorageCrypto.decryptBytes.mockReturnValue(
        new Uint8Array(Buffer.from('plaintext')),
      );

      await controller.serve(user, mockRes as unknown as Response, 'a/b.png');

      expect(mockPrisma.pendingUpload.findUnique).toHaveBeenCalledWith({
        where: { objectName: 'a/b.png' },
        select: {
          uploadedBy: true,
          v: true,
          nonce: true,
          messageId: true,
          roomMessageId: true,
        },
      });
      expect(mockS3bucket.download).toHaveBeenCalledWith('a/b.png');
      expect(mockStorageCrypto.decryptBytes).toHaveBeenCalledWith('u1', {
        v: 'storage-v1',
        ct: Buffer.from('raw-cipher').toString('base64'),
        nonce: 'n1',
      });
      expect(mockRes.set).toHaveBeenCalledWith(
        expect.objectContaining({
          'Content-Type': 'image/png',
          'Content-Length': String(Buffer.from('plaintext').length),
          // Regression: this was `public`, inviting shared caches to store
          // (and replay to other users) decrypted per-user content served
          // from behind an auth check.
          'Cache-Control': expect.stringContaining('private') as string,
        }),
      );
      expect(mockRes.end).toHaveBeenCalledWith(Buffer.from('plaintext'));
    });

    it('404s (not a raw error) when the R2 object is missing', async () => {
      mockPrisma.pendingUpload.findUnique.mockResolvedValue({
        uploadedBy: 'u1',
        v: 'storage-v1',
        nonce: 'n1',
        messageId: null,
        roomMessageId: null,
      });
      mockS3bucket.download.mockRejectedValue(new Error('NoSuchKey'));

      await expect(
        controller.serve(user, mockRes as unknown as Response, 'a/b.png'),
      ).rejects.toThrow('Attachment not found');
      expect(mockRes.end).not.toHaveBeenCalled();
    });
  });

  describe('attachmentStream', () => {
    function fakeStreamReq(chunks: Buffer[], contentLength?: number) {
      return {
        headers: contentLength
          ? { 'content-length': String(contentLength) }
          : {},
        async *[Symbol.asyncIterator]() {
          await Promise.resolve();
          for (const c of chunks) yield c;
        },
      } as never;
    }

    it('rejects a disallowed file type — regression: the unawaited FileTypeValidator promise was always truthy, so `!isValid(...)` never fired and EVERY type sailed through this endpoint', async () => {
      // 'MZ' executable magic bytes with an executable mimetype — nowhere
      // near the image/pdf/doc allow-list.
      const exe = Buffer.from('4d5a90000300000004000000ffff', 'hex');

      await expect(
        controller.attachmentStream(
          user,
          fakeStreamReq([exe]),
          'evil.exe',
          'application/x-msdownload',
          undefined,
          undefined,
        ),
      ).rejects.toThrow();

      expect(mockS3bucket.upload).not.toHaveBeenCalled();
      expect(mockPrisma.pendingUpload.upsert).not.toHaveBeenCalled();
    });
  });

  describe('attachment', () => {
    function fakeFile(overrides: Partial<Express.Multer.File> = {}) {
      return {
        originalname: 'photo.png',
        mimetype: 'image/png',
        buffer: Buffer.from('file-bytes'),
        size: 10,
        ...overrides,
      } as Express.Multer.File;
    }

    it('persists the upload inside the quota-locked transaction, not a bare top-level upsert', async () => {
      const result = await controller.attachment(user, fakeFile());

      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
      expect(mockPrisma.$executeRaw).toHaveBeenCalled();
      expect(mockUsage.assertCanUploadBytes).toHaveBeenCalledWith(
        'u1',
        10,
        'FREE',
        mockPrisma,
      );
      const upsertCall = mockPrisma.pendingUpload.upsert.mock.calls[0] as [
        { create: { uploadedBy: string; size: number } },
      ];
      expect(upsertCall[0].create).toMatchObject({
        uploadedBy: 'u1',
        size: 10,
      });
      expect(result.url).toBe('https://r2/uploads/messages/u1/x.png');
    });

    it('rejects the upload when the authoritative re-check inside the lock finds the quota exceeded — even though the earlier fast-fail check (run before the slow S3/encrypt work) had passed', async () => {
      mockUsage.assertCanUploadBytes
        .mockResolvedValueOnce(undefined) // early fast-fail check
        .mockRejectedValueOnce(new ForbiddenException('over quota')); // re-check inside the lock

      await expect(controller.attachment(user, fakeFile())).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockPrisma.pendingUpload.upsert).not.toHaveBeenCalled();
    });

    it('does not fail the upload when thumbnail generation throws — regression: generateAndStoreThumbnail\'s own doc comment promises "never throws", but nothing enforced that, so a thumbnail-library error rejected the Promise.all it shared with the real S3 upload and failed the entire upload', async () => {
      mockThumbnails.generate.mockRejectedValue(new Error('corrupt image'));

      const result = await controller.attachment(user, fakeFile());

      expect(result.url).toBe('https://r2/uploads/messages/u1/x.png');
      const upsertCall = mockPrisma.pendingUpload.upsert.mock.calls[0] as [
        { create: { thumbnailUrl: string | null } },
      ];
      expect(upsertCall[0].create.thumbnailUrl).toBeNull();
    });
  });
});
