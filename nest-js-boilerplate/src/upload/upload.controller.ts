import {
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'node:crypto';
import { ImageService, IMAGE_SIZES } from './image.service';
import { MinioService } from './minio.service';

interface ImageUrls {
  badge: string;
  medium: string;
  full: string;
}

@Controller('upload')
export class UploadController {
  constructor(
    private readonly minio: MinioService,
    private readonly images: ImageService,
  ) {}

  @Post('single')
  @UseInterceptors(FileInterceptor('file'))
  async single(@UploadedFile() file: Express.Multer.File): Promise<{
    urls: ImageUrls;
    originalname: string;
    mimetype: string;
    size: number;
  }> {
    const urls = await this.processImage(file);
    return {
      urls,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    };
  }

  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files'))
  async multiple(@UploadedFiles() files: Express.Multer.File[]): Promise<{
    count: number;
    images: ImageUrls[];
  }> {
    const results = await Promise.all(files.map((f) => this.processImage(f)));
    return { count: files.length, images: results };
  }

  @Post('validated')
  @UseInterceptors(FileInterceptor('file'))
  async validated(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 }),
          new FileTypeValidator({
            fileType: 'text/plain',
            skipMagicNumbersValidation: true,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const urls = await this.processImage(file);
    return {
      urls,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    };
  }

  private async processImage(file: Express.Multer.File): Promise<ImageUrls> {
    const ext = '.webp';
    const base = randomUUID();

    const sizes = Object.keys(IMAGE_SIZES) as (keyof typeof IMAGE_SIZES)[];
    const [badgeBuf, mediumBuf, fullBuf] = await Promise.all(
      sizes.map((s) => this.images.resize(file.buffer, s)),
    );

    const [badge, medium, full] = await Promise.all([
      this.minio.upload(
        `${base}-badge${ext}`,
        badgeBuf,
        undefined,
        'image/webp',
      ),
      this.minio.upload(
        `${base}-medium${ext}`,
        mediumBuf,
        undefined,
        'image/webp',
      ),
      this.minio.upload(`${base}-full${ext}`, fullBuf, undefined, 'image/webp'),
    ]);

    return { badge, medium, full };
  }
}
