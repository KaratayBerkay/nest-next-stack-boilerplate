import { registerAs } from '@nestjs/config';

// Namespaced config (the docs' `registerAs` pattern). Grouping related keys under a namespace
// ('database') lets consumers inject a strongly-typed slice via the generated `.KEY` token and
// `ConfigType<typeof databaseConfig>`, instead of reaching for stringly-typed `get('FOO')`.
export default registerAs('database', () => ({
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
}));
