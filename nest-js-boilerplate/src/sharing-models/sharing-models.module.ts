import { Module } from '@nestjs/common';
import { ProductsResolver } from './products.resolver';

// Sharing models: a single model class reused by the GraphQL API and (via graphql-model-shim) a
// frontend bundle. Only the backend resolver lives here; the frontend reuse is a build-time alias.
@Module({
  providers: [ProductsResolver],
})
export class SharingModelsModule {}
