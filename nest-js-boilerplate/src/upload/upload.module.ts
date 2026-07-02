import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { MinioService } from './minio.service';
import { UploadController } from './upload.controller';

@Module({
  controllers: [UploadController],
  providers: [MinioService, ImageService],
})
export class UploadModule {}
