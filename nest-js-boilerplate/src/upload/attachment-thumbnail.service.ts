import { Injectable, Logger } from '@nestjs/common';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';

const execFileAsync = promisify(execFile);

const THUMBNAIL_SIZE = { width: 320, height: 320 } as const;
const THUMBNAIL_WEBP_QUALITY = 80;
const PDF_RENDER_TIMEOUT_MS = 5000;
const TEXT_PREVIEW_MAX_LINES = 10;
const TEXT_PREVIEW_MAX_CHARS_PER_LINE = 44;

const IMAGE_MIME_RE = /^image\/(jpeg|png|webp|gif|avif)$/;

/**
 * Best-effort thumbnail generation for chat attachments. Runs server-side at
 * upload time, before the original file is encrypted, so it always sees
 * plaintext bytes. Never throws — `generate()` returns null on any failure
 * (corrupt file, missing binary, timeout) so a bad thumbnail never blocks an
 * upload; the client falls back to the icon+name chip in that case.
 */
@Injectable()
export class AttachmentThumbnailService {
  private readonly logger = new Logger(AttachmentThumbnailService.name);

  async generate(
    buffer: Buffer,
    mimetype: string,
    originalname: string,
  ): Promise<Buffer | null> {
    try {
      if (IMAGE_MIME_RE.test(mimetype)) return await this.toWebp(buffer);
      if (mimetype === 'application/pdf') return await this.fromPdf(buffer);
      if (mimetype === 'text/plain') return await this.fromText(buffer);
      // doc/docx and anything else: no safe cheap rasterizer, skip.
      return null;
    } catch (err) {
      this.logger.warn(
        `Thumbnail generation failed for "${originalname}" (${mimetype}): ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
      return null;
    }
  }

  /** Rasterize page 1 via poppler's pdftoppm (shelled out, temp-file based). */
  private async fromPdf(buffer: Buffer): Promise<Buffer> {
    const dir = await mkdtemp(join(tmpdir(), 'attachment-thumb-'));
    try {
      const inputPath = join(dir, 'input.pdf');
      const outputPrefix = join(dir, 'page');
      await writeFile(inputPath, buffer);
      await execFileAsync(
        'pdftoppm',
        [
          '-png',
          '-f',
          '1',
          '-l',
          '1',
          '-r',
          '100',
          '-singlefile',
          inputPath,
          outputPrefix,
        ],
        { timeout: PDF_RENDER_TIMEOUT_MS },
      );
      const png = await readFile(`${outputPrefix}.png`);
      return this.toWebp(png);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  }

  /** Render the first few lines as a small SVG "text card", then rasterize. */
  private async fromText(buffer: Buffer): Promise<Buffer> {
    const lines = buffer
      .toString('utf8')
      .split(/\r?\n/)
      .slice(0, TEXT_PREVIEW_MAX_LINES)
      .map((line) => line.slice(0, TEXT_PREVIEW_MAX_CHARS_PER_LINE));
    return this.toWebp(Buffer.from(textPreviewSvg(lines)));
  }

  private async toWebp(input: Buffer): Promise<Buffer> {
    const { width, height } = THUMBNAIL_SIZE;
    return sharp(input)
      .resize(width, height, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: THUMBNAIL_WEBP_QUALITY })
      .toBuffer();
  }
}

function textPreviewSvg(lines: string[]): string {
  const { width, height } = THUMBNAIL_SIZE;
  const lineHeight = 22;
  const padding = 16;
  const tspans = lines
    .map((line, i) => {
      const y = padding + (i + 1) * lineHeight;
      return `<text x="${padding}" y="${y}" font-family="monospace" font-size="14" fill="#3f3f46">${escapeXml(line)}</text>`;
    })
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="#f4f4f5"/>${tspans}</svg>`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
