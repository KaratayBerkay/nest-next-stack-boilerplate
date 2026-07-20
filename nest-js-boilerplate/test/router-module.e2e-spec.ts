/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { RouterDemoModule } from '../src/router-module/router-demo.module';

// Proves the Router module recipe (#110). RouterModule.register assigns module-level URL prefixes
// and nests them: ShopModule → /shop, with ProductsModule and OrdersModule as children →
// /shop/products and /shop/orders. None of the controllers hard-code those prefixes in @Controller;
// the prefixes come entirely from the route tree, and each controller's own method paths append.
describe('Router module / shop (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [RouterDemoModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('parent module prefix: GET /shop', async () => {
    const res = await request(app.getHttpServer()).get('/shop').expect(200);
    expect(res.body).toEqual({ route: 'shop' });
  });

  it('child prefix composes recursively: GET /shop/products', async () => {
    const res = await request(app.getHttpServer())
      .get('/shop/products')
      .expect(200);
    expect(res.body).toEqual({ route: 'shop/products' });
  });

  it('sibling child prefix: GET /shop/orders', async () => {
    const res = await request(app.getHttpServer())
      .get('/shop/orders')
      .expect(200);
    expect(res.body).toEqual({ route: 'shop/orders' });
  });

  it('controller method path appends to the composed prefix: GET /shop/products/featured', async () => {
    const res = await request(app.getHttpServer())
      .get('/shop/products/featured')
      .expect(200);
    expect(res.body).toEqual({ route: 'shop/products/featured' });
  });

  it('param route under the composed prefix: GET /shop/products/:id', async () => {
    const res = await request(app.getHttpServer())
      .get('/shop/products/42')
      .expect(200);
    expect(res.body).toEqual({ route: 'shop/products/:id', id: '42' });
  });

  it('the prefixes are required: the un-prefixed path 404s', async () => {
    await request(app.getHttpServer()).get('/products').expect(404);
  });
});
