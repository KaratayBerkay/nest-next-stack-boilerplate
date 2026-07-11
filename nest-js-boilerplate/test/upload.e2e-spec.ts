import { INestApplication } from '@nestjs/common';
import { ExecutionContext, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { UploadModule } from '../src/upload/upload.module';
import { SessionAuthGuard } from '../src/auth/session-auth.guard';

// Stub SessionAuthGuard to bypass auth in e2e tests
class StubSessionAuthGuard {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.user = { userId: 'test-user', role: 'USER', tier: 'FREE' };
    return true;
  }
}

@Module({
  imports: [UploadModule],
  providers: [{ provide: SessionAuthGuard, useClass: StubSessionAuthGuard }],
})
class TestUploadModule {}

describe('File upload (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TestUploadModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('accepts a single image file and returns its metadata', async () => {
    // 1x1 red PNG (valid image)
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      'base64',
    );
    const res = await request(app.getHttpServer())
      .post('/upload/single')
      .attach('file', png, { filename: 'test.png', contentType: 'image/png' })
      .expect(201);
    const body = res.body as {
      originalname: string;
      mimetype: string;
      size: number;
      urls: { badge: string; medium: string; full: string };
    };
    expect(body.originalname).toBe('test.png');
    expect(body.urls.badge).toBeDefined();
    expect(body.urls.medium).toBeDefined();
    expect(body.urls.full).toBeDefined();
  });

  it('rejects non-image file on single (400)', async () => {
    await request(app.getHttpServer())
      .post('/upload/single')
      .attach('file', Buffer.from('not an image'), {
        filename: 'file.txt',
        contentType: 'text/plain',
      })
      .expect(400);
  });

  it('accepts multiple image files', async () => {
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      'base64',
    );
    const res = await request(app.getHttpServer())
      .post('/upload/multiple')
      .attach('files', png, { filename: 'a.png', contentType: 'image/png' })
      .attach('files', png, { filename: 'b.png', contentType: 'image/png' })
      .expect(201);
    const body = res.body as { count: number; images: unknown[] };
    expect(body.count).toBe(2);
    expect(body.images).toHaveLength(2);
  });

  it('rejects unauthenticated request (401)', async () => {
    // Create a second app without the stub guard
    const moduleRef = await Test.createTestingModule({
      imports: [UploadModule],
    }).compile();
    const unauthApp = moduleRef.createNestApplication();
    await unauthApp.init();

    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      'base64',
    );
    await request(unauthApp.getHttpServer())
      .post('/upload/single')
      .attach('file', png, { filename: 'test.png', contentType: 'image/png' })
      .expect(401);

    await unauthApp.close();
  });
});
