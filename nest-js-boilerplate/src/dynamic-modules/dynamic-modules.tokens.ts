// Options token for the manually-written dynamic module (best practice: a named constant, not a
// bare magic string at the injection site).
export const GREETER_OPTIONS = 'GREETER_OPTIONS';

export interface GreeterOptions {
  readonly greeting: string;
}
