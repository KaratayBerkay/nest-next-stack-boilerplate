import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DogsModule } from '../src/openapi/dogs.module';
import { OpenapiModule } from '../src/openapi/openapi.module';

// Proves the OpenAPI (Swagger) section of the docs (#92-#99) end to end. We assemble the document
// exactly as docs.nestjs.com/openapi/introduction prescribes — DocumentBuilder +
// SwaggerModule.createDocument() + SwaggerModule.setup() — then assert (a) the generated, in-memory
// OpenAPIObject and (b) the JSON / YAML / UI endpoints that `setup()` mounts.

// Narrow helpers for indexing into the loosely-typed OpenAPI document without `any`.
type AnyRecord = Record<string, unknown>;
const asRecord = (v: unknown): AnyRecord => v as AnyRecord;

describe('OpenAPI / Swagger (e2e)', () => {
  let app: INestApplication;
  let document: OpenAPIObject;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [OpenapiModule, DogsModule],
    }).compile();
    app = moduleRef.createNestApplication();

    const config = new DocumentBuilder()
      .setTitle('Cats example')
      .setDescription('The cats API description')
      .setVersion('1.0')
      .addTag('cats')
      .addBearerAuth()
      .addGlobalParameters({ name: 'x-tenant-id', in: 'header' })
      .addGlobalResponse({ status: 500, description: 'Internal server error' })
      .build();

    document = SwaggerModule.createDocument(app, config);
    // Default mount: serves Swagger UI at /api, JSON at /api-json, YAML at /api-yaml.
    SwaggerModule.setup('api', app, document);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ---- #92 Introduction: DocumentBuilder + createDocument + setup ----
  describe('#92 Introduction', () => {
    it('builds a base document from DocumentBuilder', () => {
      expect(document.openapi).toMatch(/^3\./);
      expect(document.info.title).toBe('Cats example');
      expect(document.info.description).toBe('The cats API description');
      expect(document.info.version).toBe('1.0');
      expect(document.tags).toEqual(
        expect.arrayContaining([expect.objectContaining({ name: 'cats' })]),
      );
    });

    it('reflects all of the controller routes into paths', () => {
      expect(Object.keys(document.paths).sort()).toEqual([
        '/cats',
        '/cats/{id}',
        '/dogs',
      ]);
    });

    it('serves the OpenAPI JSON at /api-json', async () => {
      const res = await request(app.getHttpServer()).get('/api-json');
      expect(res.status).toBe(200);
      expect(res.type).toMatch(/json/);
      const body = asRecord(res.body);
      expect(asRecord(body.info).title).toBe('Cats example');
      expect(asRecord(body.paths)['/cats']).toBeDefined();
    });

    it('serves the OpenAPI YAML at /api-yaml', async () => {
      const res = await request(app.getHttpServer()).get('/api-yaml');
      expect(res.status).toBe(200);
      expect(res.text).toContain('openapi:');
      expect(res.text).toContain('Cats example');
    });

    it('serves the Swagger UI HTML at /api', async () => {
      const res = await request(app.getHttpServer()).get('/api');
      expect(res.status).toBe(200);
      expect(res.text.toLowerCase()).toContain('swagger-ui');
    });
  });

  // ---- #93 Types and parameters: @ApiProperty / @ApiPropertyOptional / arrays / enums ----
  describe('#93 Types and parameters', () => {
    const schema = () => asRecord(asRecord(document.components).schemas);

    it('emits a CreateCatDto schema with the documented Schema Object options', () => {
      const dto = asRecord(schema().CreateCatDto);
      const props = asRecord(dto.properties);

      expect(asRecord(props.name)).toMatchObject({
        type: 'string',
        example: 'Maru',
      });
      expect(asRecord(props.age)).toMatchObject({
        type: 'number',
        description: 'The age of a cat',
        minimum: 1,
        default: 1,
      });
      // Array property carries an explicit item type.
      expect(asRecord(props.nicknames)).toMatchObject({
        type: 'array',
        items: { type: 'string' },
      });
    });

    it('drops @ApiPropertyOptional fields from required', () => {
      const dto = asRecord(schema().CreateCatDto);
      const required = dto.required as string[];
      expect(required).toEqual(
        expect.arrayContaining(['name', 'age', 'breed', 'nicknames']),
      );
      expect(required).not.toContain('microchipId');
    });

    it('hoists the named enum into a reusable CatBreed schema referenced via $ref', () => {
      expect(asRecord(schema().CatBreed).enum).toEqual([
        'Persian',
        'Tabby',
        'Siamese',
      ]);
      const dto = asRecord(schema().CreateCatDto);
      const breed = asRecord(asRecord(dto.properties).breed);
      // The property references the standalone schema rather than inlining the values.
      expect(JSON.stringify(breed)).toContain('#/components/schemas/CatBreed');
      expect(breed.enum).toBeUndefined();
    });
  });

  // ---- #94 Operations: tags / summary / responses / params / generic allOf ----
  describe('#94 Operations', () => {
    const op = (path: string, method: string) =>
      asRecord(asRecord(document.paths[path])[method]);

    it('tags operations and sets the @ApiOperation summary', () => {
      const post = op('/cats', 'post');
      expect(post.tags).toEqual(['cats']);
      expect(post.summary).toBe('Create a cat');
    });

    it('documents @ApiCreatedResponse (201, typed) and @ApiResponse (403)', () => {
      const responses = asRecord(op('/cats', 'post').responses);
      expect(asRecord(responses['201']).description).toBe(
        'The cat has been successfully created.',
      );
      expect(JSON.stringify(responses['201'])).toContain(
        '#/components/schemas/Cat',
      );
      expect(asRecord(responses['403']).description).toBe('Forbidden.');
    });

    it('documents the @ApiQuery enum parameter on the list route', () => {
      const params = op('/cats', 'get').parameters as AnyRecord[];
      const breed = params.find((p) => p.name === 'breed');
      expect(breed).toMatchObject({ in: 'query', required: false });
      expect(JSON.stringify(breed)).toContain('Persian');
    });

    it('documents the @ApiParam path parameter on the detail route', () => {
      const params = op('/cats/{id}', 'get').parameters as AnyRecord[];
      const id = params.find((p) => p.name === 'id');
      expect(id).toMatchObject({ in: 'path', description: 'Cat identifier' });
    });

    it('supports a generic allOf response built from getSchemaPath()', () => {
      const ok = asRecord(asRecord(op('/cats', 'get').responses)['200']);
      const schema = asRecord(
        asRecord(asRecord(ok.content)['application/json']).schema,
      );
      expect(schema.allOf).toBeDefined();
      expect(JSON.stringify(schema.allOf)).toContain(
        '#/components/schemas/PaginatedCatsDto',
      );
      expect(JSON.stringify(schema.allOf)).toContain(
        '#/components/schemas/Cat',
      );
    });
  });

  // ---- #95 Security: addBearerAuth + @ApiBearerAuth ----
  describe('#95 Security', () => {
    it('registers the bearer security scheme', () => {
      const schemes = asRecord(asRecord(document.components).securitySchemes);
      expect(asRecord(schemes.bearer)).toMatchObject({
        type: 'http',
        scheme: 'bearer',
      });
    });

    it('applies the scheme to every operation via @ApiBearerAuth', () => {
      const post = asRecord(asRecord(document.paths['/cats']).post);
      expect(post.security).toEqual(
        expect.arrayContaining([expect.objectContaining({ bearer: [] })]),
      );
    });
  });

  // ---- #96 Mapped types: Partial / Pick / Omit / Intersection ----
  describe('#96 Mapped types', () => {
    const keys = (name: string) =>
      Object.keys(
        asRecord(asRecord(asRecord(document.components).schemas)[name])
          .properties as AnyRecord,
      ).sort();
    const requiredOf = (name: string) =>
      asRecord(asRecord(asRecord(document.components).schemas)[name])
        .required as string[] | undefined;

    it('PartialType makes every property optional', () => {
      expect(keys('UpdateCatDto')).toEqual(
        ['age', 'breed', 'microchipId', 'name', 'nicknames'].sort(),
      );
      // No property remains required.
      expect(requiredOf('UpdateCatDto') ?? []).toEqual([]);
    });

    it('PickType keeps only the selected property', () => {
      expect(keys('UpdateCatAgeDto')).toEqual(['age']);
    });

    it('OmitType removes the excluded property', () => {
      expect(keys('OmitNameCatDto')).toEqual(
        ['age', 'breed', 'microchipId', 'nicknames'].sort(),
      );
    });

    it('IntersectionType merges both sources', () => {
      expect(keys('FullCatDto')).toEqual(
        ['age', 'breed', 'color', 'microchipId', 'name', 'nicknames'].sort(),
      );
    });
  });

  // ---- #99 Other features: global params/responses, multi-spec, ignoreGlobalPrefix ----
  describe('#99 Other features', () => {
    it('adds global parameters to every operation (addGlobalParameters)', () => {
      const params = asRecord(asRecord(document.paths['/cats']).post)
        .parameters as AnyRecord[];
      expect(params).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'x-tenant-id', in: 'header' }),
        ]),
      );
    });

    it('adds a global response to every operation (addGlobalResponse)', () => {
      const responses = asRecord(
        asRecord(asRecord(document.paths['/cats']).post).responses,
      );
      expect(asRecord(responses['500']).description).toBe(
        'Internal server error',
      );
    });

    it('filters paths per specification via the include option', () => {
      const base = new DocumentBuilder().setTitle('x').build();
      const catsOnly = SwaggerModule.createDocument(app, base, {
        include: [OpenapiModule],
      });
      const dogsOnly = SwaggerModule.createDocument(app, base, {
        include: [DogsModule],
      });

      expect(Object.keys(catsOnly.paths)).toContain('/cats');
      expect(Object.keys(catsOnly.paths)).not.toContain('/dogs');
      expect(Object.keys(dogsOnly.paths)).toContain('/dogs');
      expect(Object.keys(dogsOnly.paths)).not.toContain('/cats');
    });

    it('honours ignoreGlobalPrefix', async () => {
      const ref = await Test.createTestingModule({
        imports: [OpenapiModule],
      }).compile();
      const prefixed = ref.createNestApplication();
      prefixed.setGlobalPrefix('api-v1');
      await prefixed.init();

      const base = new DocumentBuilder().setTitle('x').build();
      const withPrefix = SwaggerModule.createDocument(prefixed, base);
      const withoutPrefix = SwaggerModule.createDocument(prefixed, base, {
        ignoreGlobalPrefix: true,
      });

      expect(Object.keys(withPrefix.paths)).toContain('/api-v1/cats');
      expect(Object.keys(withoutPrefix.paths)).toContain('/cats');
      expect(Object.keys(withoutPrefix.paths)).not.toContain('/api-v1/cats');

      await prefixed.close();
    });
  });
});
