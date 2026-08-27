import { _classifyForTests, getUuidFieldSets } from './uuid-fields';

// Unit-proves the field-classification rule against a small synthetic schema
// — in particular the case the whole design hinges on: the same field name
// (roomId) qualifying in one model and not another.
describe('uuid-fields: schema-parse classification', () => {
  it("includes a model's own @id field", () => {
    const { fieldsByModel, globalSafeNames } = _classifyForTests(`
      model User {
        id String @id @default(uuid(7)) @db.Uuid
        email String
      }
    `);
    expect(fieldsByModel.get('User')?.has('id')).toBe(true);
    expect(globalSafeNames.has('id')).toBe(true);
  });

  it("includes a foreign key that targets the related model's own @id field", () => {
    const { fieldsByModel, globalSafeNames } = _classifyForTests(`
      model User {
        id String @id @default(uuid(7)) @db.Uuid
      }
      model Post {
        id String @id @default(uuid(7)) @db.Uuid
        authorId String @db.Uuid
        author User @relation(fields: [authorId], references: [id])
      }
    `);
    expect(fieldsByModel.get('Post')?.has('authorId')).toBe(true);
    expect(globalSafeNames.has('authorId')).toBe(true);
  });

  it("excludes a foreign key whose reference is not the target's own @id field, even though the same name qualifies on a different model", () => {
    const { fieldsByModel, globalSafeNames } = _classifyForTests(`
      model Room {
        id String @id @default(uuid(7)) @db.Uuid
        slug String @unique
      }
      model RoomParticipant {
        id String @id @default(uuid(7)) @db.Uuid
        roomId String @db.Uuid
        room Room @relation(fields: [roomId], references: [id])
      }
      model RoomMessage {
        id String @id @default(uuid(7)) @db.Uuid
        roomId String
        room Room @relation(fields: [roomId], references: [slug])
      }
    `);
    // Per-model precision: RoomParticipant.roomId genuinely targets Room.id.
    expect(fieldsByModel.get('RoomParticipant')?.has('roomId')).toBe(true);
    // ...but RoomMessage.roomId targets Room.slug, not Room.id.
    expect(fieldsByModel.get('RoomMessage')?.has('roomId')).toBe(false);
    // RoomMessage.roomId isn't @db.Uuid — it's a plain-text FK to a slug
    // column, not a rival uuid field — so it doesn't get a vote on the
    // shared name at all. RoomParticipant.roomId's genuine qualification
    // stands unopposed, and the global set can safely include it.
    expect(globalSafeNames.has('roomId')).toBe(true);
  });

  it('still drops a name from the global set when two @db.Uuid-typed FKs genuinely disagree on target field', () => {
    const { fieldsByModel, globalSafeNames } = _classifyForTests(`
      model User {
        id String @id @default(uuid(7)) @db.Uuid
        email String @unique
      }
      model Post {
        id String @id @default(uuid(7)) @db.Uuid
        authorId String @db.Uuid
        author User @relation(fields: [authorId], references: [id])
      }
      model Weird {
        id String @id @default(uuid(7)) @db.Uuid
        authorId String @db.Uuid
        author User @relation(fields: [authorId], references: [email])
      }
    `);
    // Post.authorId genuinely targets User.id...
    expect(fieldsByModel.get('Post')?.has('authorId')).toBe(true);
    // ...but Weird.authorId is ALSO @db.Uuid and targets a different
    // (non-@id) field — a real ambiguity between two uuid-shaped columns,
    // not a name coincidence with a non-uuid column. Must still be dropped
    // from the flat global set.
    expect(fieldsByModel.get('Weird')?.has('authorId')).toBe(false);
    expect(globalSafeNames.has('authorId')).toBe(false);
  });

  it('does not include a plain non-relation string field', () => {
    const { fieldsByModel, globalSafeNames } = _classifyForTests(`
      model User {
        id String @id @default(uuid(7)) @db.Uuid
        stripeCustomerId String?
      }
    `);
    expect(fieldsByModel.get('User')?.has('stripeCustomerId')).toBe(false);
    expect(globalSafeNames.has('stripeCustomerId')).toBe(false);
  });

  it('includes the manual cursor/readerId aliases in the global set only, not per-model', () => {
    const { fieldsByModel, globalSafeNames } = _classifyForTests(`
      model User {
        id String @id @default(uuid(7)) @db.Uuid
      }
    `);
    expect(globalSafeNames.has('cursor')).toBe(true);
    expect(globalSafeNames.has('readerId')).toBe(true);
    expect(fieldsByModel.get('User')?.has('cursor')).toBe(false);
  });
});

// Integration-style: proves the parser gets the REAL schema.prisma right,
// not just a synthetic stand-in — this is what would actually catch drift if
// the schema changes in a way that breaks the classification rule's
// assumptions.
describe('uuid-fields: against the real schema.prisma', () => {
  it('classifies known real fields correctly', () => {
    const { fieldsByModel, globalSafeNames } = getUuidFieldSets();

    expect(fieldsByModel.get('Post')?.has('authorId')).toBe(true);
    expect(fieldsByModel.get('Message')?.has('senderId')).toBe(true);
    expect(fieldsByModel.get('Message')?.has('recipientId')).toBe(true);
    expect(fieldsByModel.get('User')?.has('id')).toBe(true);
    expect(fieldsByModel.get('FavoriteConversation')?.has('peerId')).toBe(true);
    expect(fieldsByModel.get('MessageAttachment')?.has('messageId')).toBe(true);

    // The roomId ambiguity, for real this time: RoomMessage.roomId (a
    // plain-text FK to Room.slug, no @db.Uuid) doesn't get a vote, so
    // RoomParticipant.roomId's genuine qualification — and every RTC model's
    // (CallSession/Meeting/LiveStream/RtcReport/RtcRecording/RtcChatMessage,
    // all real @db.Uuid FKs to RtcRoom.id) — makes it into the global set.
    expect(fieldsByModel.get('RoomParticipant')?.has('roomId')).toBe(true);
    expect(fieldsByModel.get('RoomMessage')?.has('roomId')).toBe(false);
    expect(fieldsByModel.get('CallSession')?.has('roomId')).toBe(true);
    expect(fieldsByModel.get('Meeting')?.has('roomId')).toBe(true);
    expect(fieldsByModel.get('LiveStream')?.has('roomId')).toBe(true);

    expect(globalSafeNames.has('authorId')).toBe(true);
    expect(globalSafeNames.has('roomId')).toBe(true);
    expect(globalSafeNames.has('cursor')).toBe(true);
    expect(globalSafeNames.has('readerId')).toBe(true);

    // Stripe's own ids are never @db.Uuid FKs of ours — must never be swept
    // in by name coincidence.
    expect(globalSafeNames.has('stripeCustomerId')).toBe(false);
  });
});
