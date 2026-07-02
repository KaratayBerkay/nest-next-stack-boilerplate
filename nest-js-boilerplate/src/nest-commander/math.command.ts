import { Command, CommandRunner } from 'nest-commander';
import { AddCommand } from './add.command';

/**
 * nest-commander (#117) — the parent command hosting {@link AddCommand} as a sub-command.
 * `subCommands: [AddCommand]` wires the nested verb; invoking `math add ...` routes to the
 * sub-command's `run`, so this parent `run` only fires for a bare `math` (no sub-command) and is
 * intentionally a no-op (a real CLI would print usage here).
 */
@Command({
  name: 'math',
  description: 'Math operations',
  subCommands: [AddCommand],
})
export class MathCommand extends CommandRunner {
  run(): Promise<void> {
    return Promise.resolve();
  }
}
