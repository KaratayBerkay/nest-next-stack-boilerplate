import { join } from 'node:path';
import type { ServerResponse } from 'node:http';
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';

const PUBLIC_DIR = join(__dirname, 'public');

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: PUBLIC_DIR,
      serveRoot: '/static',
      exclude: ['/static/api/{*splat}'],
      serveStaticOptions: {
        index: 'index.html',
        setHeaders: (res: ServerResponse) => {
          res.setHeader('x-served-by', 'serve-static-module');
        },
      },
    }),
  ],
})
export class StaticAssetsModule {}
