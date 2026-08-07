import sharp from 'sharp';
import { AttachmentThumbnailService } from './attachment-thumbnail.service';

// Minimal hand-written PDF (malformed xref table, but poppler recovers by
// scanning for `obj` markers — real-world PDFs are frequently this loose).
// Verified against the actual `pdftoppm` binary before writing this test.
const MINIMAL_PDF = Buffer.from(
  `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>endobj
4 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
5 0 obj<</Length 44>>
stream
BT /F1 24 Tf 20 100 Td (Hello PDF) Tj ET
endstream
endobj
trailer<</Size 6/Root 1 0 R>>
%%EOF
`,
  'utf8',
);

async function isWebp(buffer: Buffer): Promise<boolean> {
  const meta = await sharp(buffer).metadata();
  return meta.format === 'webp';
}

describe('AttachmentThumbnailService', () => {
  let service: AttachmentThumbnailService;

  beforeEach(() => {
    service = new AttachmentThumbnailService();
  });

  it('generates a webp thumbnail for an image', async () => {
    const png = await sharp({
      create: {
        width: 40,
        height: 40,
        channels: 3,
        background: { r: 200, g: 100, b: 50 },
      },
    })
      .png()
      .toBuffer();

    const thumb = await service.generate(png, 'image/png', 'photo.png');

    expect(thumb).not.toBeNull();
    expect(await isWebp(thumb!)).toBe(true);
  });

  it('generates a webp thumbnail for a PDF (rasterized page 1)', async () => {
    const thumb = await service.generate(
      MINIMAL_PDF,
      'application/pdf',
      'report.pdf',
    );

    expect(thumb).not.toBeNull();
    expect(await isWebp(thumb!)).toBe(true);
  });

  it('generates a webp thumbnail for a text file', async () => {
    const text = Buffer.from(
      'Hello world\nSecond line\nThird line with <special> & "chars"',
      'utf8',
    );

    const thumb = await service.generate(text, 'text/plain', 'notes.txt');

    expect(thumb).not.toBeNull();
    expect(await isWebp(thumb!)).toBe(true);
  });

  it('returns null for types with no thumbnailer (doc/docx)', async () => {
    const thumb = await service.generate(
      Buffer.from('irrelevant'),
      'application/msword',
      'contract.doc',
    );

    expect(thumb).toBeNull();
  });

  it('never throws and returns null for a corrupt PDF', async () => {
    const garbage = Buffer.from('this is not a pdf at all, just bytes');

    await expect(
      service.generate(garbage, 'application/pdf', 'broken.pdf'),
    ).resolves.toBeNull();
  });

  it('never throws and returns null for a corrupt image', async () => {
    const garbage = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04]);

    await expect(
      service.generate(garbage, 'image/png', 'broken.png'),
    ).resolves.toBeNull();
  });
});
