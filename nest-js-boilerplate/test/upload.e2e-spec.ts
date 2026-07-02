import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { UploadModule } from '../src/upload/upload.module';

describe('File upload (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UploadModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('accepts a single file and returns its metadata', async () => {
    const res = await request(app.getHttpServer())
      .post('/upload/single')
      .attach('file', Buffer.from('hello world'), 'hello.txt')
      .expect(201);
    const body = res.body as {
      originalname: string;
      mimetype: string;
      size: number;
    };
    expect(body.originalname).toBe('hello.txt');
    expect(body.size).toBe(11);
  });

  it('accepts multiple files on a single field', async () => {
    const res = await request(app.getHttpServer())
      .post('/upload/multiple')
      .attach('files', Buffer.from('a'), 'a.txt')
      .attach('files', Buffer.from('bb'), 'b.txt')
      .expect(201);
    const body = res.body as { count: number; names: string[] };
    expect(body.count).toBe(2);
    expect(body.names).toEqual(['a.txt', 'b.txt']);
  });

  it('rejects a file that exceeds the MaxFileSizeValidator (400)', async () => {
    await request(app.getHttpServer())
      .post('/upload/validated')
      .attach('file', Buffer.alloc(2048, 'a'), {
        filename: 'big.txt',
        contentType: 'text/plain',
      })
      .expect(400);
  });

  it('rejects a file whose type fails the FileTypeValidator (400)', async () => {
    await request(app.getHttpServer())
      .post('/upload/validated')
      .attach('file', Buffer.from('{"a":1}'), {
        filename: 'data.json',
        contentType: 'application/json',
      })
      .expect(400);
  });

  it('accepts a small text file that passes all validators', async () => {
    await request(app.getHttpServer())
      .post('/upload/validated')
      .attach('file', Buffer.from('small'), {
        filename: 'ok.txt',
        contentType: 'text/plain',
      })
      .expect(201);
  });
});
