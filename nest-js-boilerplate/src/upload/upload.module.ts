import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { WireCryptoModule } from '../wire-crypto/wire-crypto.module';
import { ImageService } from './image.service';
import { MinioService } from './minio.service';
import { UploadController } from './upload.controller';

@Module({
  imports: [AuthModule, WireCryptoModule],
  controllers: [UploadController],
  providers: [MinioService, ImageService],
})
export class UploadModule {}
