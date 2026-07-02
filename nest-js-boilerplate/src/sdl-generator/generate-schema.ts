import { NestFactory } from '@nestjs/core';
import {
  GraphQLSchemaBuilderModule,
  GraphQLSchemaFactory,
} from '@nestjs/graphql';
import { printSchema } from 'graphql';
import { RecipesResolver } from './recipes.resolver';

// Generates the GraphQL SDL from resolvers WITHOUT booting the full app (docs.nestjs.com/graphql/
// generating-sdl): a throwaway Nest context built from GraphQLSchemaBuilderModule + the schema
// factory, with no HTTP server, driver or database. Returns the SDL string so callers (a build
// script, or the proof test) can print or assert it.
export async function generateSchema(): Promise<string> {
  const app = await NestFactory.create(GraphQLSchemaBuilderModule, {
    logger: false,
  });
  await app.init();
  try {
    const factory = app.get(GraphQLSchemaFactory);
    const schema = await factory.create([RecipesResolver]);
    return printSchema(schema);
  } finally {
    await app.close();
  }
}
