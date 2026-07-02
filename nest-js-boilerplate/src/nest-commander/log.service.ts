import { Injectable } from '@nestjs/common';

/**
 * nest-commander (#117) — the injected dependency the commands use to emit their result.
 *
 * The docs' `BasicCommand` calls `this.logService.log(...)`; this provider is the documented
 * collaborator. Writing to stdout makes the *real* CLI (`cli.ts`) observable, while the proof
 * spec overrides this provider with a Jest mock (per the docs' Testing section) and asserts the
 * payload each command produced — proving option parsing + routing without scraping stdout.
 */
@Injectable()
export class LogService {
  log(value: Record<string, unknown>): void {
    process.stdout.write(`${JSON.stringify(value)}\n`);
  }
}
