import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { Readable } from 'node:stream';

/**
 * Cloudflare R2 object storage (S3-compatible), exposed as S3BucketService.
 * The `minio` npm client is just an S3 client and works against R2's S3
 * endpoint — configured with path-style addressing, which R2 requires.
 * Objects stay private; chat attachments are served through the
 * decrypt-and-serve endpoint and avatar URLs are rewritten via
 * R2_PUBLIC_URL (a public bucket domain, e.g. https://assets.eys.gen.tr,
 * mapped to the bucket root).
 */
@Injectable()
export class S3BucketService implements OnModuleInit {
  private readonly logger = new Logger(S3BucketService.name);
  private client!: Minio.Client;
  private bucket!: string;
  private publicUrl!: string;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    const endpoint = this.config.get<string>('R2_ENDPOINT', '');
    const accessKey = this.config.get<string>('R2_ACCESS_KEY_ID', '');
    const secretKey = this.config.get<string>('R2_SECRET_ACCESS_KEY', '');
    this.bucket = this.config.get<string>('R2_BUCKET', 'uploads');
    this.publicUrl = this.config.get<string>('R2_PUBLIC_URL', endpoint);

    let url: URL;
    try {
      url = new URL(endpoint);
    } catch {
      throw new Error(
        `Invalid R2_ENDPOINT "${endpoint}" — set it to https://<account-id>.r2.cloudflarestorage.com in the backend Vault secret`,
      );
    }

    if (!accessKey || !secretKey) {
      this.logger.warn(
        'R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY not set — uploads will fail',
      );
    }
    this.client = new Minio.Client({
      endPoint: url.hostname,
      port: Number(url.port) || (url.protocol === 'https:' ? 443 : 80),
      useSSL: url.protocol === 'https:',
      accessKey,
      secretKey,
      region: 'auto',
      pathStyle: true,
    });

    await this.ensureBucket();
  }

  private async ensureBucket() {
    try {
      const exists = await this.client.bucketExists(this.bucket);
      if (!exists) {
        await this.client.makeBucket(this.bucket);
        this.logger.log(`Created R2 bucket "${this.bucket}"`);
      }
    } catch (err) {
      this.logger.warn(
        `Failed to ensure R2 bucket "${this.bucket}": ${String(err)}. Create it in the Cloudflare dashboard.`,
      );
    }
  }

  async upload(
    objectName: string,
    stream: Buffer | Readable,
    size?: number,
    mimetype?: string,
  ): Promise<string> {
    const meta: Record<string, string> = {};
    if (mimetype) meta['Content-Type'] = mimetype;

    await this.client.putObject(this.bucket, objectName, stream, size, meta);

    return `${this.publicUrl}/${objectName}`;
  }

  async remove(objectName: string): Promise<void> {
    await this.client.removeObject(this.bucket, objectName);
  }

  /**
   * Fully buffers an R2 object. The sole caller (GET /upload/serve) always
   * needs the complete ciphertext anyway — AEAD decryption can't verify the
   * auth tag from a partial buffer — so there's no benefit to exposing a raw
   * stream here. Objects are capped at MAX_FILE_SIZE_BYTES (10 MB).
   */
  async download(objectName: string): Promise<Buffer> {
    const stream = await this.client.getObject(this.bucket, objectName);
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(
        Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as Uint8Array),
      );
    }
    return Buffer.concat(chunks);
  }

  /**
   * Existence check used by the R2 backfill script. Any error (not-found,
   * network) reads as "doesn't exist" — safe because the caller's fallback
   * (re-upload) is idempotent.
   */
  async exists(objectName: string): Promise<boolean> {
    try {
      await this.client.statObject(this.bucket, objectName);
      return true;
    } catch {
      return false;
    }
  }
}
