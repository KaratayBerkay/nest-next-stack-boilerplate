import {
  Controller,
  FileTypeValidator,
  FileValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'node:crypto';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { ImageService, IMAGE_SIZES } from './image.service';
import { MinioService } from './minio.service';

interface ImageUrls {
  badge: string;
  medium: string;
  full: string;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_IMAGE_TYPES = /^image\/(jpeg|png|webp|gif|avif)$/;
const ALLOWED_ATTACHMENT_TYPES =
  /^(image\/(jpeg|png|webp|gif|avif)|application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document|text\/plain)$/;
const MAX_FILES = 10;

const ATTACHMENT_EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    '.docx',
  'text/plain': '.txt',
};

// Legacy formats with no reliable magic bytes — validated by declared type
// only, mirroring the pre-existing avatar endpoints' rigor for everything else
// (F36).
const LEGACY_DOC_TYPES =
  /^(application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document|text\/plain)$/;

class ChatAttachmentTypeValidator extends FileValidator<{
  fileType: string | RegExp;
}> {
  private readonly strict = new FileTypeValidator({
    fileType: ALLOWED_ATTACHMENT_TYPES,
    skipMagicNumbersValidation: false,
  });
  private readonly declared = new FileTypeValidator({
    fileType: ALLOWED_ATTACHMENT_TYPES,
    skipMagicNumbersValidation: true,
  });

  isValid(file: Express.Multer.File): boolean | Promise<boolean> {
    const validator = LEGACY_DOC_TYPES.test(file.mimetype)
      ? this.declared
      : this.strict;
    return validator.isValid(file);
  }

  buildErrorMessage(file: Express.Multer.File): string {
    const validator = LEGACY_DOC_TYPES.test(file.mimetype)
      ? this.declared
      : this.strict;
    return validator.buildErrorMessage(file);
  }
}

@UseGuards(SessionAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(
    private readonly minio: MinioService,
    private readonly images: ImageService,
  ) {}

  @Post('single')
  @UseInterceptors(FileInterceptor('file'))
  async single(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE_BYTES }),
          new FileTypeValidator({
            fileType: ALLOWED_IMAGE_TYPES,
            skipMagicNumbersValidation: false,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<{
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
  @UseInterceptors(FilesInterceptor('files', MAX_FILES))
  async multiple(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE_BYTES }),
          new FileTypeValidator({
            fileType: ALLOWED_IMAGE_TYPES,
            skipMagicNumbersValidation: false,
          }),
        ],
      }),
    )
    files: Express.Multer.File[],
  ): Promise<{
    count: number;
    images: ImageUrls[];
  }> {
    const results = await Promise.all(files.map((f) => this.processImage(f)));
    return { count: files.length, images: results };
  }

  @Post('attachment')
  @UseInterceptors(FileInterceptor('file'))
  async attachment(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE_BYTES }),
          // Images and PDFs are verified against their magic bytes (as strict
          // as /upload/single); only the legacy doc formats (no reliable
          // signature) fall back to declared-type validation (F36).
          new ChatAttachmentTypeValidator({
            fileType: ALLOWED_ATTACHMENT_TYPES,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<{
    url: string;
    originalname: string;
    mimetype: string;
    size: number;
  }> {
    const extension =
      ATTACHMENT_EXTENSIONS[file.mimetype] ?? this.extFromName(file.originalname);
    const objectName = `${randomUUID()}${extension}`;
    const url = await this.minio.upload(
      objectName,
      file.buffer,
      undefined,
      file.mimetype,
    );
    return {
      url,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    };
  }

  private extFromName(originalname: string): string {
    const match = /\.([a-z0-9]{1,10})$/i.exec(originalname);
    return match ? `.${match[1].toLowerCase()}` : '';
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
