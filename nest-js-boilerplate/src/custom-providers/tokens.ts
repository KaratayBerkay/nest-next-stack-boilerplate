// Non-class DI tokens (strings) — the docs note you can also use symbols or enums. Defined in
// their own file so consumers import the token, not a magic string. Used by the useFactory and
// useExisting providers below.
export const CONNECTION = 'CONNECTION';
export const OPTIONAL_FLAG = 'OPTIONAL_FLAG';
export const ALIASED_LOGGER = 'AliasedLoggerService';
