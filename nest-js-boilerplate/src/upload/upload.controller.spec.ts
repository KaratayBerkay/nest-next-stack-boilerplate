import type { Response } from 'express';
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
  let mockPrisma: {
    pendingUpload: { findUnique: jest.Mock };
    message: { findUnique: jest.Mock };
    roomMessage: { findUnique: jest.Mock };
  };
  let mockRes: { set: jest.Mock; end: jest.Mock };

  const user = { userId: 'u1', tier: 'FREE' } as never;

  beforeEach(() => {
    mockS3bucket = {
      upload: jest.fn(),
      remove: jest.fn(),
      download: jest.fn(),
      exists: jest.fn(),
    };
    mockStorageCrypto = {
      decryptBytes: jest.fn(),
      encryptBytes: jest.fn(),
    };
    mockPrisma = {
      pendingUpload: { findUnique: jest.fn() },
      message: { findUnique: jest.fn() },
      roomMessage: { findUnique: jest.fn() },
    };
    mockRes = { set: jest.fn(), end: jest.fn() };

    controller = new UploadController(
      mockS3bucket as never,
      {} as never,
      {} as never,
      mockStorageCrypto as never,
      mockPrisma as never,
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
});
