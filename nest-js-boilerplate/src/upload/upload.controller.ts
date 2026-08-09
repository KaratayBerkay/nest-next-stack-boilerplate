import {
  BadRequestException,
  Controller,
  FileTypeValidator,
  FileValidator,
  Get,
  Headers,
  MaxFileSizeValidator,
  NotFoundException,
  ParseFilePipe,
  PayloadTooLargeException,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { AttachmentThumbnailService } from './attachment-thumbnail.service';
import { ImageService, IMAGE_SIZES } from './image.service';
import { S3BucketService } from './s3-bucket.service';
import { StorageCryptoService } from '../wire-crypto/storage-crypto.service';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtUser } from '../auth/auth.types';
import { hasRoomTierAccess } from '../messaging/messaging.service';
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

// Object-storage foldering: chat attachments land under
// `uploads/messages/<userId>/…` (DM) or `uploads/chat-room/<room>/…` (rooms)
// so the bucket stays browsable and per-scope quotas/cleanup can target a
// prefix. The client announces the target on the request headers so the one
// upload endpoint can serve both composers.
const SCOPE_KIND_HEADER = 'x-scope-kind';
const SCOPE_ID_HEADER = 'x-scope-id';
const ROOM_SLUG_RE = /^[a-z0-9-]{1,64}$/;

interface UploadScope {
  kind: 'MESSAGES' | 'CHAT_ROOM';
  scopeId: string;
  prefix: string;
  // Thumbnails live under a top-level `thumbnails/` folder next to (not
  // nested inside) the scope folder, e.g.
  // `uploads/chat-room/thumbnails/<roomId>/<uuid>.webp`, so the bucket can
  // be browsed/lifecycle-ruled by originals vs thumbnails independently.
  thumbnailPrefix: string;
}

function resolveUploadScope(
  user: JwtUser,
  scopeKind: string | undefined,
  scopeId: string | undefined,
): UploadScope {
  if (scopeKind === 'chat-room') {
    const roomId = (scopeId ?? '').trim();
    if (!roomId || !ROOM_SLUG_RE.test(roomId)) {
      throw new BadRequestException(
        'Invalid chat-room upload scope — x-scope-id must be a room slug',
      );
    }
    return {
      kind: 'CHAT_ROOM',
      scopeId: roomId,
      prefix: `uploads/chat-room/${roomId}/`,
      thumbnailPrefix: `uploads/chat-room/thumbnails/${roomId}/`,
    };
  }
  // Direct-message uploads always land in the uploader's own folder.
  return {
    kind: 'MESSAGES',
    scopeId: user.userId,
    prefix: `uploads/messages/${user.userId}/`,
    thumbnailPrefix: `uploads/messages/thumbnails/${user.userId}/`,
  };
}

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

const EXT_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  avif: 'image/avif',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  txt: 'text/plain',
};

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
    private readonly s3bucket: S3BucketService,
    private readonly images: ImageService,
    private readonly thumbnails: AttachmentThumbnailService,
    private readonly storageCrypto: StorageCryptoService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Best-effort: generates a thumbnail for the plaintext buffer and, if one
   * comes back, encrypts + uploads it as its own R2 object with its own
   * `PendingUpload` row (so the existing, unmodified `/upload/serve` route
   * can find and decrypt it like any other object). Returns null — never
   * throws — when the type isn't thumbnailed or generation fails; the
   * caller simply omits `thumbnailUrl` in that case.
   */
  private async generateAndStoreThumbnail(
    buffer: Buffer,
    mimetype: string,
    originalname: string,
    scope: UploadScope,
    userId: string,
  ): Promise<string | null> {
    const thumbnail = await this.thumbnails.generate(
      buffer,
      mimetype,
      originalname,
    );
    if (!thumbnail) return null;

    const objectName = `${scope.thumbnailPrefix}${randomUUID()}.webp`;
    const envelope = this.storageCrypto.encryptBytes(
      userId,
      new Uint8Array(thumbnail),
    );
    const url = await this.s3bucket.upload(
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
        nonce: envelope.nonce,
        uploadedBy: userId,
        size: thumbnail.length,
        kind: scope.kind,
        scopeId: scope.scopeId,
        filename: originalname,
        mimetype: 'image/webp',
      },
      update: {},
    });
    return url;
  }

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
    @Headers(SCOPE_KIND_HEADER) scopeKind?: string,
    @Headers(SCOPE_ID_HEADER) scopeId?: string,
  ): Promise<{
    url: string;
    originalname: string;
    mimetype: string;
    size: number;
    envelope?: { v: string; nonce: string; ct: string };
  }> {
    const scope = resolveUploadScope(user, scopeKind, scopeId);
    const extension =
      ATTACHMENT_EXTENSIONS[file.mimetype] ??
      this.extFromName(file.originalname);
    const objectName = `${scope.prefix}${randomUUID()}${extension}`;

    await this.assertUploadStorageCapacity(user, file.size);

    const envelope = this.storageCrypto.encryptBytes(
      user.userId,
      new Uint8Array(file.buffer),
    );

    const [url, thumbnailUrl] = await Promise.all([
      this.s3bucket.upload(
        objectName,
        Buffer.from(envelope.ct, 'base64'),
        undefined,
        'application/octet-stream',
      ),
      this.generateAndStoreThumbnail(
        file.buffer,
        file.mimetype,
        file.originalname,
        scope,
        user.userId,
      ),
    ]);
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
        nonce: envelope.nonce,
        uploadedBy: user.userId,
        size: file.size,
        kind: scope.kind,
        scopeId: scope.scopeId,
        filename: file.originalname,
        mimetype: file.mimetype,
        thumbnailUrl,
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
    @Headers(SCOPE_KIND_HEADER) scopeKind?: string,
    @Headers(SCOPE_ID_HEADER) scopeId?: string,
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
    const fake = {
      originalname,
      mimetype,
      buffer,
      size: buffer.length,
    } as Express.Multer.File;

    const validator = new ChatAttachmentTypeValidator({
      fileType: ALLOWED_ATTACHMENT_TYPES,
    });
    if (!validator.isValid(fake)) {
      throw new BadRequestException(validator.buildErrorMessage(fake));
    }

    const scope = resolveUploadScope(user, scopeKind, scopeId);
    const extension =
      ATTACHMENT_EXTENSIONS[mimetype] ?? this.extFromName(originalname);
    const objectName = `${scope.prefix}${randomUUID()}${extension}`;

    await this.assertUploadStorageCapacity(user, buffer.length);

    const envelope = this.storageCrypto.encryptBytes(
      user.userId,
      new Uint8Array(buffer),
    );

    const [url, thumbnailUrl] = await Promise.all([
      this.s3bucket.upload(
        objectName,
        Buffer.from(envelope.ct, 'base64'),
        undefined,
        'application/octet-stream',
      ),
      this.generateAndStoreThumbnail(
        buffer,
        mimetype,
        originalname,
        scope,
        user.userId,
      ),
    ]);
    await this.prisma.pendingUpload.upsert({
      where: { objectName },
      create: {
        objectName,
        url,
        v: envelope.v,
        nonce: envelope.nonce,
        uploadedBy: user.userId,
        size: buffer.length,
        kind: scope.kind,
        scopeId: scope.scopeId,
        filename: originalname,
        mimetype,
        thumbnailUrl,
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

  /**
   * Serve a decrypted attachment. The R2 bucket stores encrypted blobs;
   * this endpoint looks up the PendingUpload envelope, decrypts with the
   * uploader's per-user key, and streams the plaintext back with the correct
   * Content-Type so <img> / <a> tags can consume it directly.
   *
   * `objectName` travels as a query param (percent-encoded) because after
   * foldering it contains slashes, which a path segment cannot hold.
   */
  @Get('serve')
  @UseGuards(SessionAuthGuard)
  async serve(
    @CurrentUser() user: JwtUser,
    @Res() res: Response,
    @Query('objectName') objectName?: string,
  ) {
    if (!objectName?.trim()) {
      throw new BadRequestException('Missing objectName query parameter');
    }
    const pending = await this.prisma.pendingUpload.findUnique({
      where: { objectName },
      select: {
        uploadedBy: true,
        v: true,
        nonce: true,
        messageId: true,
        roomMessageId: true,
      },
    });
    if (!pending) throw new NotFoundException('Attachment not found');
    await this.assertCanAccessUpload(user, pending);

    let plain: Uint8Array;
    try {
      const ciphertext = await this.s3bucket.download(objectName);
      plain = this.storageCrypto.decryptBytes(pending.uploadedBy, {
        v: pending.v,
        ct: ciphertext.toString('base64'),
        nonce: pending.nonce,
      });
    } catch {
      throw new NotFoundException('Attachment not found');
    }

    const ext = objectName.split('.').pop()?.toLowerCase() ?? '';
    const contentType = EXT_MIME[ext] ?? 'application/octet-stream';

    res.set({
      'Content-Type': contentType,
      'Content-Length': String(plain.length),
      'Cache-Control': 'public, max-age=31536000, immutable',
    });
    res.end(Buffer.from(plain));
  }

  /**
   * Ownership/membership gate for decrypted attachment bytes. A PendingUpload
   * row on its own proves nothing about the requester — it's keyed by
   * objectName, guessable-shaped, and readable by any logged-in user unless
   * gated here. Allowed callers: the uploader themselves (covers in-flight
   * uploads not yet attached to any message, e.g. an abandoned composer), the
   * sender/recipient of the DM the attachment ended up on, or a room member
   * with sufficient tier for the room it ended up on. Throws the same 404 for
   * "doesn't exist" and "not yours" so the endpoint doesn't leak which
   * objectNames are real.
   */
  private async assertCanAccessUpload(
    user: JwtUser,
    pending: {
      uploadedBy: string;
      messageId: string | null;
      roomMessageId: string | null;
    },
  ): Promise<void> {
    if (pending.uploadedBy === user.userId) return;

    if (pending.messageId) {
      const message = await this.prisma.message.findUnique({
        where: { id: pending.messageId },
        select: { senderId: true, recipientId: true },
      });
      if (
        message &&
        (message.senderId === user.userId ||
          message.recipientId === user.userId)
      ) {
        return;
      }
    } else if (pending.roomMessageId) {
      const roomMessage = await this.prisma.roomMessage.findUnique({
        where: { id: pending.roomMessageId },
        select: { roomId: true },
      });
      if (roomMessage && hasRoomTierAccess(roomMessage.roomId, user.tier)) {
        return;
      }
    }

    throw new NotFoundException('Attachment not found');
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
      this.s3bucket.upload(
        `${base}-badge${ext}`,
        badgeBuf,
        undefined,
        'image/webp',
      ),
      this.s3bucket.upload(
        `${base}-medium${ext}`,
        mediumBuf,
        undefined,
        'image/webp',
      ),
      this.s3bucket.upload(
        `${base}-full${ext}`,
        fullBuf,
        undefined,
        'image/webp',
      ),
    ]);

    return { badge, medium, full };
  }
}
