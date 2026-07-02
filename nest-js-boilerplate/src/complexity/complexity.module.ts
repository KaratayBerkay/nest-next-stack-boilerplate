import { Module } from '@nestjs/common';
import { ItemsResolver } from './items.resolver';

// GraphQL query-complexity feature. The cost-enforcing ComplexityPlugin injects
// GraphQLSchemaHost, which is only resolvable in the module scope that imports
// GraphQLModule.forRoot — so the plugin is registered at the composition root (AppModule /
// the test's root module) alongside this module, which owns the resolver + costed types.
@Module({
  providers: [ItemsResolver],
})
export class ComplexityModule {}
