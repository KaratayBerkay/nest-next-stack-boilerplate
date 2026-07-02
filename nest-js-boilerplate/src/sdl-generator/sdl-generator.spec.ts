import { generateSchema } from './generate-schema';

// Proves programmatic SDL generation (docs.nestjs.com/graphql/generating-sdl): GraphQLSchemaBuilder
// Module + GraphQLSchemaFactory build a schema from resolver classes with no running app / HTTP /
// database, and `printSchema` renders the SDL.
describe('SDL generator (GraphQLSchemaBuilderModule)', () => {
  let sdl: string;

  beforeAll(async () => {
    sdl = await generateSchema();
  });

  it('emits the SDL for the resolver object types', () => {
    expect(sdl).toContain('type Recipe');
    expect(sdl).toContain('id: ID!');
    expect(sdl).toContain('preparationTimeMinutes: Int!');
    expect(sdl).toContain('ingredients: [String!]!');
    expect(sdl).toContain('description: String'); // nullable -> no trailing !
  });

  it('emits the Query type with the resolver fields', () => {
    expect(sdl).toContain('type Query');
    expect(sdl).toContain('recipe(id: ID!): Recipe!');
    expect(sdl).toContain('recipes: [Recipe!]!');
  });

  it('includes the @ObjectType description in the SDL', () => {
    expect(sdl).toContain('A cooking recipe');
  });
});
