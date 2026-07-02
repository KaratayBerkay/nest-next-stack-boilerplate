const env = (key: string, fallback: string): string =>
  process.env[key] ?? fallback;

/**
 * Build the Mongo connection URI from `MONGO_URL` (.env), but force a
 * per-process-unique database so repeated/concurrent e2e runs never share state
 * on the dev Mongo container (`docker compose --profile mongo up`). The fallback
 * mirrors the repo's .env defaults so the proof also works without dotenv loaded.
 */
export const mongooseUri = (): string => {
  const base = env(
    'MONGO_URL',
    'mongodb://nest:nest@localhost:27017/nest?authSource=admin',
  );
  const url = new URL(base);
  url.pathname = `/nest_mongoose_demo_${process.pid}`;
  return url.toString();
};
