import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { WireCryptoModule } from '../wire-crypto/wire-crypto.module';
import { AttachmentThumbnailService } from './attachment-thumbnail.service';
import { ImageService } from './image.service';
import { S3BucketService } from './s3-bucket.service';
import { UploadController } from './upload.controller';

@Module({
  imports: [AuthModule, WireCryptoModule],
  controllers: [UploadController],
  providers: [S3BucketService, ImageService, AttachmentThumbnailService],
})
export class UploadModule {}
