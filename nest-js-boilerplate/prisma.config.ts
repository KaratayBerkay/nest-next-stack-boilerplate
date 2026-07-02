import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

// Prisma 7 moved the connection URL out of schema.prisma into this config file.
// `import 'dotenv/config'` is required because Prisma 7 no longer auto-loads .env.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
});
