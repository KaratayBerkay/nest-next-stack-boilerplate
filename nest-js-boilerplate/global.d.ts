// Automock/Suites (#119) — wires the Suites adapters into the type system, per the recipe.
// The first augments `Mocked<T>` with the Jest doubles API (e.g. `.mockResolvedValue`); the second
// supplies the NestJS DI `IdentifierMetadata` type. Done here (not via the packages' postinstalls,
// which can't resolve their target .d.ts under pnpm's non-flat node_modules — see Docs issues log).
/// <reference types="@suites/doubles.jest/unit" />
/// <reference types="@suites/di.nestjs/types" />
