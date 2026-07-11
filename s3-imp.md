# S3 Direct Image Serving Implementation

## Goal

Serve images directly from MinIO (`https://minio.eys.gen.tr`) to the browser, removing the Next.js proxy overhead. After upload, the browser fetches images straight from the S3 bucket.

## Target Architecture

```
Upload:   Browser → Next.js BFF → NestJS Backend → MinIO
Display:  Browser → MinIO (https://minio.eys.gen.tr/uploads/...) directly
```

## Frontend Changes (Next.js)

### 1. Delete URL rewriting utility
- Delete `src/lib/rewrite-minio-url.ts`

### 2. Remove `rewriteUrls()` from all BFF routes
Remove the import and call from these files — pass backend response through as-is:
- `src/app/api/upload/route.ts`
- `src/app/api/profile/route.ts`
- `src/app/api/profile/update/route.ts`
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/register/route.ts`

### 3. Delete the image proxy route
- Delete `src/app/api/uploads/[...path]/route.ts`

### 4. Update CSP headers
In `src/proxy.ts`, add `https://minio.eys.gen.tr` to `img-src`:
```
img-src 'self' blob: data: https://minio.eys.gen.tr;
```

### 5. Update `next.config.ts`
Add MinIO to `images.remotePatterns`:
```ts
{ protocol: "https", hostname: "minio.eys.gen.tr" },
```

### 6. Clean up environment variables (`src/lib/env.ts`)
- Remove `MINIO_URL` from `serverEnvSchema` (was only used by the deleted proxy)
- Keep `NEXT_PUBLIC_MINIO_PUBLIC_URL` in `clientEnvSchema` (used by `src/lib/image.ts` if needed)

### 7. Update `docker-compose.yml`
- Remove `NEXT_PUBLIC_MINIO_PUBLIC_URL` build arg that pointed to `app.eys.gen.tr/api`

---

## Backend Changes (NestJS) — Run from backend project root

### Prompt for backend changes:

```
I need to change how image URLs are generated in the upload service.

Currently, `MinioService.upload()` returns URLs using `MINIO_PUBLIC_URL` which
defaults to `http://{MINIO_ENDPOINT}:{MINIO_PORT}` (internal Docker hostname
like `http://minio:9000`).

The frontend no longer proxies images through Next.js. Browsers now fetch
images directly from MinIO at `https://minio.eys.gen.tr`.

Changes needed:

1. In `src/upload/minio.service.ts`:
   - The `upload()` method at line 77 returns `${this.publicUrl}/${this.bucket}/${objectName}`
   - No code change needed — just ensure `MINIO_PUBLIC_URL` env var is set to
     `https://minio.eys.gen.tr` in the deployment environment

2. Verify the `uploads` bucket has a public read policy (already exists in
   `ensureBucket()` at lines 38-63 and in `docker-compose.yml` minio-setup service)

3. Verify CORS on the MinIO bucket allows `https://app.eys.gen.tr` as origin.
   If MinIO is behind nginx, the CORS headers may need to be on nginx instead.

4. Environment variable to set in production:
   MINIO_PUBLIC_URL=https://minio.eys.gen.tr

No code changes required in the backend — only environment configuration.
```

---

## MinIO / Infrastructure

- Ensure `https://minio.eys.gen.tr` has a valid TLS certificate
- Ensure the `uploads` bucket policy allows anonymous `s3:GetObject` (already configured)
- If MinIO is behind nginx, ensure nginx proxies port 9000 (S3 API) and passes through CORS headers

---

## Verification

1. Upload an image via account settings → check browser DevTools Network tab
2. The upload response should contain `https://minio.eys.gen.tr/uploads/...` URLs
3. The avatar `<img>` `src` should point to `https://minio.eys.gen.tr/uploads/...`
4. Image loads directly from MinIO — no request to `/api/uploads/...`
5. No Mixed Content warnings in console
