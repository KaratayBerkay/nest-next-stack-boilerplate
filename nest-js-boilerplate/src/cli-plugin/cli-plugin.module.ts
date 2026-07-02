import { Module } from '@nestjs/common';
import { BooksResolver } from './books.resolver';

// Demonstrates the @nestjs/graphql CLI plugin (docs.nestjs.com/graphql/cli-plugin): the `Book`
// model declares plain typed properties with no @Field decorators, and the plugin annotates them
// at build time. The plugin is enabled in nest-cli.json (scoped to `.gqlmodel.ts`) and mirrored for
// Jest via test/graphql-plugin.transformer.js + test/jest-cli-plugin.json.
//
// NOTE: this module is intentionally NOT registered in AppModule. The un-decorated model only has
// fields after the plugin/transformer runs; the shared ts-jest e2e config doesn't run it, so adding
// Book to the app schema there would yield a fieldless type. It is proven by its dedicated config.
@Module({
  providers: [BooksResolver],
})
export class CliPluginModule {}
