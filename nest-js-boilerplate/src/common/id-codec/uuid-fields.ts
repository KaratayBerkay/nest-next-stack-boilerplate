import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Which field names actually mean "database uuid" — parsed directly from
// prisma/schema.prisma rather than Prisma's runtime DMMF. Verified empirically
// (Prisma 7, @prisma/client 7.8): the runtime `Prisma.dmmf` export is
// intentionally minimal — scalar fields carry only {name, kind, type} and
// relation fields only {name, kind, type, relationName}. No `isId`, no
// `relationFromFields`/`relationToFields`. Whatever builds the full DMMF for
// codegen (the `prisma-nestjs-graphql` generator that populates
// src/@generated) gets it through a separate generator-time channel, not
// through the published client runtime. The schema text itself carries the
// exact same information (`@id`, `@relation(fields: [...], references: [...])`),
// so we parse it directly instead. schema.prisma ships in both the dev
// working directory and the production image (Dockerfile COPYs prisma/ into
// the runtime stage, and the process always runs from /app), so
// process.cwd()-relative resolution is safe in every environment.
//
// A field counts as a uuid field iff: (a) it's the model's own `@id` field,
// or (b) it's a relation's FK scalar that is itself `@db.Uuid`-typed AND
// whose `references` is exactly the target model's own `@id` field name.
//
// That target-aware check matters: `RoomParticipant.roomId` references
// `Room.id` (a real uuid FK — should be encrypted), but `RoomMessage.roomId`
// references `Room.slug` (a routing slug like "general"/"vip-..." — must
// never be touched, `messaging.controller.ts`'s `rooms/:roomSlug/messages`
// route depends on it staying a plain string). Same field name, different
// models, different answers — so a single flat name set can't represent both
// correctly. `fieldsByModel` keeps full per-model precision (used by the
// GraphQL schema transformer, which has type context via `mapSchema`).
//
// `globalSafeNames` is the flattened set used by REST/WS, where there's no
// type context to disambiguate with. The `@db.Uuid` check is what lets it
// still be precise: `RoomMessage.roomId` isn't `@db.Uuid` (it's a plain-text
// FK to a slug column), so it never participates in the qualify/disqualify
// vote for the name "roomId" at all — it's simply not uuid-shaped, not an
// ambiguous case. That leaves every *other* `roomId` (RtcRoom-backed:
// RoomParticipant, CallSession, Meeting, LiveStream, RtcReport,
// RtcRecording, RtcChatMessage — all real `@db.Uuid` FKs to their own
// RtcRoom/Room, all genuinely wanting encryption) free to qualify globally
// with nothing left to conflict with. A conflict between two *both*
// `@db.Uuid`-typed FKs that disagree on target field would still be a real
// ambiguity and still gets conservatively dropped — see the "genuinely
// ambiguous" test below.

// Payload/param keys that carry an id value under a name that doesn't match
// any real Prisma field — found by grepping actual call sites, not guessed:
//   - `cursor`: keyset-pagination arg in post.resolver.ts, notification
//     .resolver.ts, notification.controller.ts — always a Message/Post/
//     Notification id used as `where: { id: cursor }`.
//   - `readerId`: messaging-dm.service.ts's markConversationRead WS payload
//     — a User.id under a locally-chosen key, not a schema field name.
//   - `deviceId`: sessions.resolver.ts's mySessions response
//     (`deviceId: session.deviceId ?? ''`) — a raw Device.id under a
//     hand-picked field name; caught live (`me`-style bug — see
//     id-encryption-transport-boundary-2026-08-19 memory).
//   - `callId`: rtc-call-ws.gateway.ts's WS protocol — a CallSession.id
//     carried under a locally-chosen key (there's no scalar `callId` FK
//     anywhere in the schema for a per-model classification to pick up).
// Used by the flat args/REST/WS decrypt-deep and encrypt-deep walkers, and
// also by encryptFieldIfId's fallback path for any GraphQL type that isn't a
// recognized Prisma model (see that function's doc comment).
const MANUAL_ID_ALIASES = ['cursor', 'readerId', 'deviceId', 'callId'];

interface ParsedField {
  name: string;
  type: string;
  isId: boolean;
  isUuidTyped: boolean;
  relationFields?: string[];
  relationReferences?: string[];
}

interface ParsedModel {
  name: string;
  fields: ParsedField[];
}

function parseSchema(schemaText: string): ParsedModel[] {
  const models: ParsedModel[] = [];
  const modelRe = /model\s+(\w+)\s*\{([\s\S]*?)\n[ \t]*\}/g;
  let modelMatch: RegExpExecArray | null;
  while ((modelMatch = modelRe.exec(schemaText))) {
    const [, modelName, body] = modelMatch;
    const fields: ParsedField[] = [];
    for (const rawLine of body.split('\n')) {
      const line = rawLine.trim();
      if (!line || line.startsWith('//') || line.startsWith('@@')) continue;
      const tokens = line.split(/\s+/);
      if (tokens.length < 2) continue;
      const [name, rawType] = tokens;
      const type = rawType.replace(/[?[\]]/g, '');
      const attrs = [...line.matchAll(/@(\w+)/g)].map((m) => m[1]);
      let relationFields: string[] | undefined;
      let relationReferences: string[] | undefined;
      if (attrs.includes('relation')) {
        // `fields:`/`references:` aren't always the first argument — a named
        // relation's string comes first, e.g. `@relation("PostAuthor",
        // fields: [authorId], references: [id], onDelete: Cascade)` — so
        // these are matched independently against the whole line rather than
        // anchored to right after the opening paren.
        const fieldsMatch = /fields:\s*\[([^\]]*)\]/.exec(line);
        const referencesMatch = /references:\s*\[([^\]]*)\]/.exec(line);
        if (fieldsMatch && referencesMatch) {
          relationFields = fieldsMatch[1]
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
          relationReferences = referencesMatch[1]
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        }
      }
      fields.push({
        name,
        type,
        isId: attrs.includes('id'),
        // Matches `@db.Uuid` specifically, not any `@db.*` native-type
        // annotation (`@db.Text`, `@db.Timestamptz`, ...) — those say
        // nothing about whether the column is uuid-shaped.
        isUuidTyped: /@db\.Uuid\b/.test(line),
        relationFields,
        relationReferences,
      });
    }
    models.push({ name: modelName, fields });
  }
  return models;
}

function classify(models: ParsedModel[]): {
  fieldsByModel: Map<string, Set<string>>;
  globalSafeNames: Set<string>;
} {
  const idFieldByModel = new Map<string, string>();
  for (const m of models) {
    const idField = m.fields.find((f) => f.isId);
    if (idField) idFieldByModel.set(m.name, idField.name);
  }

  const fieldsByModel = new Map<string, Set<string>>();
  const qualifiedNames = new Set<string>();
  const disqualifiedNames = new Set<string>();

  for (const m of models) {
    const set = new Set<string>();
    const ownId = idFieldByModel.get(m.name);
    if (ownId) {
      set.add(ownId);
      qualifiedNames.add(ownId);
    }
    // Scalar field name -> is it declared @db.Uuid? A `@relation(...)` line
    // (e.g. `author User @relation(fields: [authorId], references: [id])`)
    // never carries `@db.Uuid` itself — that annotation lives on the
    // separate scalar FK column (`authorId String @db.Uuid`), a sibling
    // field in the same model. Looked up by name below, not off `f`.
    const uuidTypedFieldNames = new Set(
      m.fields.filter((f) => f.isUuidTyped).map((f) => f.name),
    );
    for (const f of m.fields) {
      if (!f.relationFields || !f.relationReferences) continue;
      const targetIdField = idFieldByModel.get(f.type);
      const qualifies =
        targetIdField !== undefined &&
        f.relationReferences.length === 1 &&
        f.relationReferences[0] === targetIdField;
      for (const fkName of f.relationFields) {
        // Not a uuid column at all (e.g. RoomMessage.roomId, a plain-text FK
        // to Room.slug) — it can't be "the same id field, wrong target" the
        // way two @db.Uuid FKs could; it's simply a different kind of data
        // that happens to share a name. Skip it so it can't veto a sibling
        // model's genuinely-uuid-typed field of the same name (see this
        // file's top-of-file doc comment on `roomId`).
        if (!uuidTypedFieldNames.has(fkName)) continue;
        if (qualifies) {
          set.add(fkName);
          qualifiedNames.add(fkName);
        } else {
          disqualifiedNames.add(fkName);
        }
      }
    }
    fieldsByModel.set(m.name, set);
  }

  const globalSafeNames = new Set<string>();
  for (const name of qualifiedNames) {
    if (!disqualifiedNames.has(name)) globalSafeNames.add(name);
  }
  for (const alias of MANUAL_ID_ALIASES) globalSafeNames.add(alias);

  return { fieldsByModel, globalSafeNames };
}

let cached: ReturnType<typeof classify> | undefined;

/** Parses+classifies schema.prisma once, then memoizes — the schema doesn't
 *  change while the process is running. */
export function getUuidFieldSets(): {
  fieldsByModel: Map<string, Set<string>>;
  globalSafeNames: Set<string>;
} {
  if (cached) return cached;
  const schemaPath = join(process.cwd(), 'prisma/schema.prisma');
  const schemaText = readFileSync(schemaPath, 'utf8');
  cached = classify(parseSchema(schemaText));
  return cached;
}

/** Test-only: re-parse from a given schema string instead of reading disk. */
export function _classifyForTests(schemaText: string): {
  fieldsByModel: Map<string, Set<string>>;
  globalSafeNames: Set<string>;
} {
  return classify(parseSchema(schemaText));
}
