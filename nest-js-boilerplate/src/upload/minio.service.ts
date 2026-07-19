import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { Readable } from 'node:stream';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private client!: Minio.Client;
  private bucket!: string;
  private publicUrl!: string;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    const endPoint = this.config.get<string>('MINIO_ENDPOINT', 'localhost');
    const port = Number(this.config.get('MINIO_PORT', '9000'));
    const useSSL = this.config.get('MINIO_USE_SSL', 'false') === 'true';
    const accessKey = this.config.get<string>('MINIO_ACCESS_KEY', 'minioadmin');
    const secretKey = this.config.get<string>('MINIO_SECRET_KEY', 'minioadmin');
    this.bucket = this.config.get<string>('MINIO_BUCKET', 'uploads');
    this.publicUrl = this.config.get<string>(
      'MINIO_PUBLIC_URL',
      `http://${endPoint}:${port}`,
    );

    this.client = new Minio.Client({
      endPoint,
      port,
      useSSL,
      accessKey,
      secretKey,
    });

    await this.ensureBucket();
  }

  private async ensureBucket() {
    try {
      const exists = await this.client.bucketExists(this.bucket);
      if (!exists) {
        await this.client.makeBucket(this.bucket);
        await this.client.setBucketPolicy(
          this.bucket,
          JSON.stringify({
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Principal: '*',
                Action: ['s3:GetObject'],
                Resource: [`arn:aws:s3:::${this.bucket}/*`],
              },
            ],
          }),
        );
        this.logger.log(`Created bucket "${this.bucket}" with public read`);
      }
    } catch (err) {
      this.logger.warn(
        `Failed to ensure bucket "${this.bucket}": ${err}. Files will not be uploaded to MinIO.`,
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

    return `${this.publicUrl}/${this.bucket}/${objectName}`;
  }

  async remove(objectName: string): Promise<void> {
    await this.client.removeObject(this.bucket, objectName);
  }
}
