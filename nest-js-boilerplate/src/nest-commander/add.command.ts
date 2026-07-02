import { CommandRunner, SubCommand } from 'nest-commander';
import { LogService } from './log.service';

/**
 * nest-commander (#117) — a `@SubCommand`. The docs *mention* `@SubCommand` but ship no example,
 * so this implements it to prove the API: a `@SubCommand`-decorated `CommandRunner` is attached to
 * a parent via the parent's `@Command({ subCommands: [...] })`, and is invoked as a nested verb
 * (`math add 2 3 4`). It receives the positional params the same way a top-level command does.
 */
@SubCommand({ name: 'add', description: 'Sum the passed integers' })
export class AddCommand extends CommandRunner {
  constructor(private readonly logService: LogService) {
    super();
  }

  run(passedParams: string[]): Promise<void> {
    const sum = passedParams.reduce((acc, n) => acc + Number(n), 0);
    this.logService.log({ op: 'add', sum });
    return Promise.resolve();
  }
}
