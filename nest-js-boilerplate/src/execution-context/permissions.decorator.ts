import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

// The low-level approach: a custom decorator wrapping the built-in @SetMetadata, read back by key.
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
