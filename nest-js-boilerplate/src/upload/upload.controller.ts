import {
  BadRequestException,
  Controller,
  FileTypeValidator,
  FileValidator,
  Headers,
  MaxFileSizeValidator,
  ParseFilePipe,
  PayloadTooLargeException,
  Post,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { randomUUID } from 'node:crypto';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { ImageService, IMAGE_SIZES } from './image.service';
import { MinioService } from './minio.service';
import { StorageCryptoService } from '../wire-crypto/storage-crypto.service';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtUser } from '../auth/auth.types';
import { SubscriptionTier } from '../@generated/prisma/subscription-tier.enum';
import {
  FREE_UPLOAD_STORAGE_BYTES,
  TIER_STORAGE_MULTIPLIER,
} from '../usage/usage.constants';

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
    private readonly storageCrypto: StorageCryptoService,
    private readonly prisma: PrismaService,
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
    @CurrentUser() user: JwtUser,
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
    envelope?: { v: string; nonce: string; ct: string };
  }> {
    const extension =
      ATTACHMENT_EXTENSIONS[file.mimetype] ??
      this.extFromName(file.originalname);
    const objectName = `${randomUUID()}${extension}`;

    await this.assertUploadStorageCapacity(user, file.size);

    const envelope = this.storageCrypto.encryptBytes(
      user.userId,
      new Uint8Array(file.buffer),
    );

    const url = await this.minio.upload(
      objectName,
      Buffer.from(envelope.ct, 'base64'),
      undefined,
      'application/octet-stream',
    );
    // The envelope is generated server-side, so persist it here keyed by the
    // object name. Messaging services resolve it from the attachment `url`
    // at message-save time, which keeps the full-file ciphertext off the WS
    // frame (the socket is capped at 64 KiB per frame).
    await this.prisma.pendingUpload.upsert({
      where: { objectName },
      create: {
        objectName,
        url,
        v: envelope.v,
        ct: envelope.ct,
        nonce: envelope.nonce,
        uploadedBy: user.userId,
        size: file.size,
      },
      update: {},
    });
    return {
      url,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      envelope,
    };
  }

  /**
   * Streaming attachment upload. The client sends `application/octet-stream`
   * straight as the request body (no multipart), and the server reads the
   * in-flight stream in chunks instead of buffering through multer. The file
   * is still encrypted whole-buffer server-side after the stream completes,
   * so the at-rest envelope format (`storage-v1`) and the `PendingUpload`
   * store are unchanged. This endpoint is what powers the WhatsApp-style
   * byte-level progress bar on the web client.
   */
  @Post('attachment-stream')
  async attachmentStream(
    @CurrentUser() user: JwtUser,
    @Req() req: Request,
    @Headers('x-filename') rawFilename?: string,
    @Headers('x-content-type') contentType?: string,
  ): Promise<{
    url: string;
    originalname: string;
    mimetype: string;
    size: number;
  }> {
    // Reject oversized uploads up front when the client announced a size.
    const announced = Number(req.headers['content-length'] ?? 0);
    if (announced > MAX_FILE_SIZE_BYTES) {
      throw new PayloadTooLargeException(
        'File exceeds the 10 MB attachment limit',
      );
    }

    const buffer = await this.readBodyStream(req);
    if (buffer.length > MAX_FILE_SIZE_BYTES) {
      throw new PayloadTooLargeException(
        'File exceeds the 10 MB attachment limit',
      );
    }

    let originalname = 'file';
    if (rawFilename) {
      try {
        originalname = decodeURIComponent(rawFilename).slice(0, 255);
      } catch {
        // Malformed percent-encoding isn't worth failing the upload for.
      }
    }
    const mimetype = contentType || 'application/octet-stream';

    // FileTypeValidator only reads `buffer` + `mimetype` (magic bytes sniff),
    // so a plain object stands in for the multer file here.
    const fake = { originalname, mimetype, buffer, size: buffer.length } as
      Express.Multer.File;

    const validator = new ChatAttachmentTypeValidator({
      fileType: ALLOWED_ATTACHMENT_TYPES,
    });
    if (!validator.isValid(fake)) {
      throw new BadRequestException(validator.buildErrorMessage(fake));
    }

    const extension =
      ATTACHMENT_EXTENSIONS[mimetype] ?? this.extFromName(originalname);
    const objectName = `${randomUUID()}${extension}`;

    await this.assertUploadStorageCapacity(user, buffer.length);

    const envelope = this.storageCrypto.encryptBytes(
      user.userId,
      new Uint8Array(buffer),
    );

    const url = await this.minio.upload(
      objectName,
      Buffer.from(envelope.ct, 'base64'),
      undefined,
      'application/octet-stream',
    );
    await this.prisma.pendingUpload.upsert({
      where: { objectName },
      create: {
        objectName,
        url,
        v: envelope.v,
        ct: envelope.ct,
        nonce: envelope.nonce,
        uploadedBy: user.userId,
        size: buffer.length,
      },
      update: {},
    });
    return {
      url,
      originalname,
      mimetype,
      size: buffer.length,
    };
  }

  private async readBodyStream(req: Request): Promise<Buffer> {
    const chunks: Buffer[] = [];
    let size = 0;
    for await (const chunk of req) {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      size += buf.length;
      if (size > MAX_FILE_SIZE_BYTES) {
        throw new PayloadTooLargeException(
          'File exceeds the 10 MB attachment limit',
        );
      }
      chunks.push(buf);
    }
    return Buffer.concat(chunks);
  }

  private extFromName(originalname: string): string {
    const match = /\.([a-z0-9]{1,10})$/i.exec(originalname);
    return match ? `.${match[1].toLowerCase()}` : '';
  }

  /**
   * Rejects the upload when persisting it would push the user past their
   * tier's upload-storage allowance (250 MB for FREE, doubled per upgrade).
   * PendingUpload is the authoritative source — it is append-only and every
   * chat attachment upload writes exactly one row.
   */
  private async assertUploadStorageCapacity(
    user: JwtUser,
    additionalBytes: number,
  ): Promise<void> {
    const tier = (user.tier as SubscriptionTier) ?? SubscriptionTier.FREE;
    const multiplier = TIER_STORAGE_MULTIPLIER[tier] ?? 1;
    const agg = await this.prisma.pendingUpload.aggregate({
      _sum: { size: true },
      where: { uploadedBy: user.userId },
    });
    const used = agg._sum.size ?? 0;
    if (used + additionalBytes > FREE_UPLOAD_STORAGE_BYTES * multiplier) {
      throw new PayloadTooLargeException(
        'Upload storage limit reached — upgrade your plan or remove files',
      );
    }
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
