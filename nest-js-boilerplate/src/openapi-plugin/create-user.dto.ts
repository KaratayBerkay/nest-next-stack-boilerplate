import { IsEmail, Max, Min } from 'class-validator';

/**
 * Swagger CLI plugin proof (docs.nestjs.com/openapi/cli-plugin).
 *
 * This DTO carries **no `@ApiProperty` decorators**. The `@nestjs/swagger/plugin` AST transformer
 * (wired for Jest via test/openapi-plugin.transformer.js + test/jest-openapi-plugin.json) annotates
 * every property at compile time, inferring from the TypeScript source:
 *
 * - `@ApiProperty` on each property (type inferred from the TS type);
 * - `required: false` for the optional `isEnabled?`;
 * - `default` value from the initializer (`isEnabled = true`);
 * - validation rules from the `class-validator` decorators (`classValidatorShim`):
 *   `@IsEmail` → `format: email`, `@Min`/`@Max` → `minimum`/`maximum`;
 * - descriptions and `@example` values from the JSDoc comments (`introspectComments`).
 *
 * The `class-validator` decorators are kept because they still drive runtime validation — the
 * plugin only mirrors them into the schema, it does not replace them.
 *
 * NOTE: every property is intentionally a scalar. Under `ts-jest`'s per-file incremental program the
 * plugin mis-resolves the element type of an **array** (or enum-array) property to the host class,
 * which surfaces as a false "circular dependency" at `createDocument()` — see the Docs issues log.
 * Array/enum inference itself works under `nest build` (a full TS program); it is not exercised here.
 */
export class CreateUserDto {
  /** The user's email address. */
  @IsEmail()
  email: string;

  /**
   * The user's age in years.
   * @example 30
   */
  @Min(18)
  @Max(120)
  age: number;

  /** Whether the account is enabled. */
  isEnabled?: boolean = true;
}
