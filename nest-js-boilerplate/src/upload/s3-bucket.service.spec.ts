import { ConfigService } from '@nestjs/config';
import { Readable } from 'node:stream';
import { S3BucketService } from './s3-bucket.service';

type StubbedClient = {
  getObject: jest.Mock;
  statObject: jest.Mock;
};

/**
 * client/bucket are only ever populated by onModuleInit(), which opens a
 * real R2 connection — for a unit test we skip that and inject a stub
 * client directly, the same way the service uses it internally.
 */
function buildService(): { service: S3BucketService; client: StubbedClient } {
  const service = new S3BucketService({} as ConfigService);
  const client: StubbedClient = {
    getObject: jest.fn(),
    statObject: jest.fn(),
  };
  Object.assign(service, { client, bucket: 'test-bucket' });
  return { service, client };
}

describe('S3BucketService', () => {
  describe('download', () => {
    it('buffers a multi-chunk R2 object into a single Buffer', async () => {
      const { service, client } = buildService();
      client.getObject.mockResolvedValue(
        Readable.from([Buffer.from('hello '), Buffer.from('world')]),
      );

      const result = await service.download('messages/thumbnails/u1/a.webp');

      expect(client.getObject).toHaveBeenCalledWith(
        'test-bucket',
        'messages/thumbnails/u1/a.webp',
      );
      expect(result).toEqual(Buffer.from('hello world'));
    });

    it('propagates a getObject rejection (e.g. missing key)', async () => {
      const { service, client } = buildService();
      client.getObject.mockRejectedValue(new Error('NoSuchKey'));

      await expect(service.download('missing.png')).rejects.toThrow(
        'NoSuchKey',
      );
    });
  });

  describe('exists', () => {
    it('returns true when statObject resolves', async () => {
      const { service, client } = buildService();
      client.statObject.mockResolvedValue({ size: 123 });

      await expect(service.exists('present.png')).resolves.toBe(true);
      expect(client.statObject).toHaveBeenCalledWith(
        'test-bucket',
        'present.png',
      );
    });

    it('returns false when statObject rejects', async () => {
      const { service, client } = buildService();
      client.statObject.mockRejectedValue(new Error('NotFound'));

      await expect(service.exists('missing.png')).resolves.toBe(false);
    });
  });
});
