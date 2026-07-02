import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import {
  MVC_PUBLIC_DIR,
  MVC_VIEWS_DIR,
  MvcModule,
} from '../src/mvc/mvc.module';

// Proves the documented MVC setup over HTTP: hbs view engine + @Render, dynamic
// @Res().render(), and useStaticAssets serving files from the public dir.
describe('MVC (e2e)', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [MvcModule],
    }).compile();
    app = moduleRef.createNestApplication<NestExpressApplication>();
    app.useStaticAssets(MVC_PUBLIC_DIR);
    app.setBaseViewsDir(MVC_VIEWS_DIR);
    app.setViewEngine('hbs');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('@Render renders the named view with the returned model', async () => {
    const res = await request(app.getHttpServer()).get('/mvc').expect(200);
    expect(res.headers['content-type']).toMatch(/text\/html/);
    expect(res.text).toContain('<h1>Hello world!</h1>');
  });

  it('@Res().render selects the view and model dynamically', async () => {
    const res = await request(app.getHttpServer())
      .get('/mvc/dynamic/Ada')
      .expect(200);
    expect(res.text).toContain('Hello, Ada!');
  });

  it('useStaticAssets serves files from the public dir', async () => {
    const res = await request(app.getHttpServer())
      .get('/style.css')
      .expect(200);
    expect(res.headers['content-type']).toMatch(/text\/css/);
    expect(res.text).toContain('rebeccapurple');
  });
});
