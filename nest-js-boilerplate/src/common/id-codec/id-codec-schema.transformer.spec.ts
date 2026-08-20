import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  graphql,
} from 'graphql';
import { idCodecSchemaTransformer } from './id-codec-schema.transformer';
import { encryptId, decryptId, _resetKeysForTests } from './id-codec';

// End-to-end through an actual graphql-js execution — the one thing none of
// id-codec.util.spec.ts's isolated function calls prove: that mapSchema
// wiring + real field-by-field resolution actually produces correctly
// decrypted args and encrypted (non-double-encrypted) nested output, exactly
// as it will inside the real app's GraphQLModule.forRoot({ transformSchema }).
//
// Built from plain graphql-js primitives rather than @graphql-tools/schema's
// makeExecutableSchema — that package isn't a direct dependency here (only a
// transitive one), and this only needs a couple of types anyway.
describe('idCodecSchemaTransformer: end-to-end through a real schema execution', () => {
  const REAL_POST_ID = '01890a5d-ac96-774b-bcce-b302099a8057';
  const REAL_AUTHOR_ID = '01890a5d-ac96-774b-bcce-b302099a8058';

  beforeAll(() => {
    process.env.ENCRYPTION_KEY = 'test-encryption-key-for-id-codec-specs';
    _resetKeysForTests();
  });

  function buildTestSchema() {
    let receivedArgId: string | undefined;
    const postType = new GraphQLObjectType({
      name: 'Post',
      fields: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        authorId: { type: new GraphQLNonNull(GraphQLString) },
        title: { type: new GraphQLNonNull(GraphQLString) },
      },
    });
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          post: {
            type: postType,
            args: { id: { type: new GraphQLNonNull(GraphQLID) } },
            resolve: (_source: unknown, args: { id: string }) => {
              receivedArgId = args.id;
              return {
                id: REAL_POST_ID,
                authorId: REAL_AUTHOR_ID,
                title: 'hello',
              };
            },
          },
        },
      }),
    });
    return {
      schema: idCodecSchemaTransformer(schema),
      getReceivedArgId: () => receivedArgId,
    };
  }

  it('decrypts an incoming ID arg before the resolver runs, and encrypts id-shaped output fields (matching the real Post model — title untouched)', async () => {
    const { schema, getReceivedArgId } = buildTestSchema();
    const token = encryptId(REAL_POST_ID);
    const result = await graphql({
      schema,
      source: `query($id: ID!) { post(id: $id) { id authorId title } }`,
      variableValues: { id: token },
    });
    expect(result.errors).toBeUndefined();
    expect(getReceivedArgId()).toBe(REAL_POST_ID); // resolver saw the REAL uuid

    const post = result.data!.post as {
      id: string;
      authorId: string;
      title: string;
    };
    expect(post.id).not.toBe(REAL_POST_ID);
    expect(decryptId(post.id)).toBe(REAL_POST_ID);
    expect(post.authorId).not.toBe(REAL_AUTHOR_ID);
    expect(decryptId(post.authorId)).toBe(REAL_AUTHOR_ID);
    expect(post.title).toBe('hello');
  });

  it('rejects a malformed id argument with a clean error instead of crashing', async () => {
    const { schema } = buildTestSchema();
    const result = await graphql({
      schema,
      source: `query($id: ID!) { post(id: $id) { id } }`,
      variableValues: { id: 'not-a-valid-token' },
    });
    expect(result.errors).toBeDefined();
    expect(result.errors![0].message).toBe('Invalid id');
  });

  // Regression for a live bug: the `me` query's return type is
  // SessionUserPayload, a hand-written type with no matching Prisma model —
  // fieldsByModel.get('SessionUserPayload') is undefined, so without the
  // fallback in encryptFieldIfId, `me { id }` shipped the raw database uuid
  // straight to the browser. Reproduced here with an equivalently
  // unrecognized type name, through the real mapSchema pipeline.
  it('still encrypts an id field on a GraphQL type with no matching Prisma model, via the flat-set fallback', async () => {
    const REAL_USER_ID = '01890a5d-ac96-774b-bcce-b302099a8059';
    const sessionUserType = new GraphQLObjectType({
      name: 'SessionUserPayload',
      fields: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        email: { type: new GraphQLNonNull(GraphQLString) },
      },
    });
    const schema = idCodecSchemaTransformer(
      new GraphQLSchema({
        query: new GraphQLObjectType({
          name: 'Query',
          fields: {
            me: {
              type: sessionUserType,
              resolve: () => ({ id: REAL_USER_ID, email: 'a@x.com' }),
            },
          },
        }),
      }),
    );
    const result = await graphql({
      schema,
      source: `query { me { id email } }`,
    });
    expect(result.errors).toBeUndefined();
    const me = result.data!.me as { id: string; email: string };
    expect(me.id).not.toBe(REAL_USER_ID);
    expect(decryptId(me.id)).toBe(REAL_USER_ID);
    expect(me.email).toBe('a@x.com');
  });
});
