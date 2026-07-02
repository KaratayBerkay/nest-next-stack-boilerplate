import { CommandFactory } from 'nest-commander';
import { CliModule } from './cli.module';

/**
 * nest-commander (#117) — the documented CLI entrypoint. `CommandFactory.run(rootModule)` boots a
 * Nest application context (no HTTP server), wires every discovered command into commander, parses
 * `process.argv` and dispatches to the matching command's `run`. `--help`/`--version` are added
 * automatically. The second arg trims Nest's bootstrap logging to warnings/errors.
 *
 * Run it (ts-node) as: `node -r ts-node/register src/nest-commander/cli.ts basic --number 5`.
 */
async function bootstrap(): Promise<void> {
  await CommandFactory.run(CliModule, ['warn', 'error']);
}

void bootstrap();
