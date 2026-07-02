import { Exclude, Expose, Transform } from 'class-transformer';
import { RoleEntity } from './role.entity';

// docs.nestjs.com/techniques/serialization — the entity carrying class-transformer rules that the
// ClassSerializerInterceptor applies (via `instanceToPlain`) before the response is sent:
//   • @Exclude  → strips `password` from every response
//   • @Transform → replaces the nested `role` object with just its `name`
//   • @Expose   → adds a computed `fullName` (getter alias) to the output
export class UserEntity {
  id!: number;
  firstName!: string;
  lastName!: string;

  @Exclude()
  password!: string;

  // Return only the role's name instead of the whole nested object. The docs write `value.name`;
  // under strict TS we cast the `any` `value` to RoleEntity first to keep it type-safe.
  // `toPlainOnly` scopes the transform to serialization (instanceToPlain) only — without it, the
  // `@SerializeOptions({ type })` route would run it twice (once on the inbound plainToInstance,
  // collapsing role to a string, then again on the way out — `'admin'.name` → undefined → dropped).
  @Transform(({ value }) => (value as RoleEntity).name, { toPlainOnly: true })
  role!: RoleEntity;

  @Expose()
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
