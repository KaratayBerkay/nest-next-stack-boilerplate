// docs.nestjs.com/techniques/serialization — a small nested entity used to demonstrate
// `@Transform`: the user holds a full RoleEntity, but the serialized response should carry
// only its `name`.
export class RoleEntity {
  id!: number;
  name!: string;

  constructor(partial: Partial<RoleEntity>) {
    Object.assign(this, partial);
  }
}
