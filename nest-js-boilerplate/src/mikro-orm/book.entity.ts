import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

/**
 * #106 MikroORM. Data-Mapper entity: `@Entity()` + `@PrimaryKey()` + `@Property()`
 * from `@mikro-orm/core`. Kept flat (no relations) on purpose — the docs warn
 * that MikroORM wraps relations in `Reference<T>`/`Collection<T>`, which Nest's
 * built-in serializer can't see; a flat entity serializes cleanly over HTTP.
 */
@Entity()
export class Book {
  @PrimaryKey()
  id!: number;

  @Property()
  title!: string;

  @Property()
  author!: string;
}
