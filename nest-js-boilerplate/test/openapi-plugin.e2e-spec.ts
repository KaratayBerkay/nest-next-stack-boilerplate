import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { Test } from '@nestjs/testing';
import { OpenapiPluginModule } from '../src/openapi-plugin/openapi-plugin.module';

// Proves the @nestjs/swagger CLI plugin (docs.nestjs.com/openapi/cli-plugin): CreateUserDto declares
// NO @ApiProperty decorators, yet the generated OpenAPI document fully describes it — properties,
// types, required flags, defaults, validation rules, descriptions and examples — because the
// plugin's AST transformer ran during compilation (test/openapi-plugin.transformer.js, wired via
// test/jest-openapi-plugin.json). Without the transformer, CreateUserDto would have zero properties.

type AnyRecord = Record<string, unknown>;
const asRecord = (v: unknown): AnyRecord => v as AnyRecord;

describe('Swagger CLI plugin (e2e)', () => {
  let app: INestApplication;
  let document: OpenAPIObject;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [OpenapiPluginModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();

    const config = new DocumentBuilder().setTitle('Users').build();
    document = SwaggerModule.createDocument(app, config);
  });

  afterAll(async () => {
    await app?.close();
  });

  const userSchema = () =>
    asRecord(asRecord(asRecord(document.components).schemas).CreateUserDto);

  it('auto-annotated every DTO property (no @ApiProperty in source)', () => {
    const props = asRecord(userSchema().properties);
    expect(Object.keys(props).sort()).toEqual(['age', 'email', 'isEnabled']);
  });

  it('inferred each property type from the TypeScript type', () => {
    const props = asRecord(userSchema().properties);
    expect(asRecord(props.email).type).toBe('string');
    expect(asRecord(props.age).type).toBe('number');
    expect(asRecord(props.isEnabled).type).toBe('boolean');
  });

  it('set required from the optional marker (isEnabled? is not required)', () => {
    const required = (userSchema().required as string[]) ?? [];
    expect(required).toEqual(expect.arrayContaining(['email', 'age']));
    expect(required).not.toContain('isEnabled');
  });

  it('derived the default from the property initializer', () => {
    const props = asRecord(userSchema().properties);
    expect(asRecord(props.isEnabled).default).toBe(true);
  });

  it('mirrored class-validator rules into the schema (classValidatorShim)', () => {
    const props = asRecord(userSchema().properties);
    expect(asRecord(props.email).format).toBe('email');
    expect(asRecord(props.age).minimum).toBe(18);
    expect(asRecord(props.age).maximum).toBe(120);
  });

  it('pulled descriptions and examples from JSDoc comments (introspectComments)', () => {
    const props = asRecord(userSchema().properties);
    expect(asRecord(props.email).description).toBe("The user's email address.");
    expect(asRecord(props.age).example).toBe(30);
  });

  it('turned the controller JSDoc into an @ApiOperation summary', () => {
    const post = asRecord(asRecord(document.paths['/users']).post);
    expect(post.summary).toBe('Create a new user');
  });

  it('auto-added a typed response decorator to the endpoint', () => {
    const responses = asRecord(
      asRecord(asRecord(document.paths['/users']).post).responses,
    );
    // The plugin injects a response for the POST (default status 201) WITH a typed JSON body — a
    // bare, plugin-less default response carries no `content`. (The precise return-model `$ref` is
    // subject to the same ts-jest cross-file type-resolution limitation noted in the DTO; under
    // `nest build` it resolves to `#/components/schemas/CreateUserDto`.)
    const created = asRecord(responses['201']);
    const schema = asRecord(
      asRecord(asRecord(created.content)['application/json']).schema,
    );
    expect(schema).toBeDefined();
  });
});
