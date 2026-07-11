import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ImageService } from './image.service';
import { MinioService } from './minio.service';
import { UploadController } from './upload.controller';

@Module({
  imports: [AuthModule],
  controllers: [UploadController],
  providers: [MinioService, ImageService],
})
export class UploadModule {}
