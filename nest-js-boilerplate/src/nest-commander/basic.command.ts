import { Command, CommandRunner, Option } from 'nest-commander';
import { LogService } from './log.service';

/**
 * Typed shape of the parsed `--number/--string/--boolean` options. The docs leave the run
 * signature's `options` loosely typed (`Record<string, any>`); strict TS gets a real interface.
 */
export interface BasicCommandOptions {
  string?: string;
  boolean?: boolean;
  number?: number;
}

/**
 * nest-commander (#117) — the docs' canonical `BasicCommand`, verbatim in behaviour.
 *
 * `@Command({ name: 'basic' })` registers the command; the class extends `CommandRunner` and
 * implements `run(passedParams, options)`. Each `@Option` decorates a *parser* method whose return
 * value becomes the typed option (`parseNumber` → `number`, etc.). nest-commander discovers all of
 * this from decorator metadata at bootstrap — no manual commander wiring. `LogService` is injected
 * by ordinary Nest DI (commands are providers).
 */
@Command({ name: 'basic', description: 'A parameter parse' })
export class BasicCommand extends CommandRunner {
  constructor(private readonly logService: LogService) {
    super();
  }

  // The framework's abstract `run` returns `Promise<void>`; the docs write `async run`, but these
  // bodies are synchronous, so we return a resolved promise to satisfy the repo's `require-await`
  // lint without faking an `await`. Behaviour and the awaited signature are identical.
  run(passedParams: string[], options?: BasicCommandOptions): Promise<void> {
    if (options?.boolean !== undefined && options?.boolean !== null) {
      this.runWithBoolean(passedParams, options.boolean);
    } else if (options?.number) {
      this.runWithNumber(passedParams, options.number);
    } else if (options?.string) {
      this.runWithString(passedParams, options.string);
    } else {
      this.runWithNone(passedParams);
    }
    return Promise.resolve();
  }

  @Option({
    flags: '-n, --number [number]',
    description: 'A basic number parser',
  })
  parseNumber(val: string): number {
    return Number(val);
  }

  @Option({
    flags: '-s, --string [string]',
    description: 'A string return',
  })
  parseString(val: string): string {
    return val;
  }

  @Option({
    flags: '-b, --boolean [boolean]',
    description: 'A boolean parser',
  })
  parseBoolean(val: string): boolean {
    return JSON.parse(val) as boolean;
  }

  private runWithString(param: string[], option: string): void {
    this.logService.log({ param, string: option });
  }

  private runWithNumber(param: string[], option: number): void {
    this.logService.log({ param, number: option });
  }

  private runWithBoolean(param: string[], option: boolean): void {
    this.logService.log({ param, boolean: option });
  }

  private runWithNone(param: string[]): void {
    this.logService.log({ param });
  }
}
